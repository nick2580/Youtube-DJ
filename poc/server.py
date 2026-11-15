"""
yt-dj local helper. Run from the poc folder:
    .venv\\Scripts\\python server.py        (or double-click start-helper.bat)
Listens on http://127.0.0.1:8765 for the Chrome extension.

Pipeline (FLASH):
  * /warm [ids]  -> every queued track is downloaded (3 in parallel) and prepped on the warm GPU
                    (Demucs vocals + fast analysis) in the background, in queue order.
  * /prepare a,b -> waits for both tracks (usually already prepped), then mix search + render (~1 s).
"""
import io, json, os, re, subprocess, sys, threading, time, traceback, urllib.request
from concurrent.futures import Future, ThreadPoolExecutor

sys.stdout.reconfigure(encoding="utf-8", errors="replace"); sys.stderr.reconfigure(encoding="utf-8", errors="replace")
os.chdir(os.path.dirname(os.path.abspath(__file__)))

import soundfile as sf  # noqa: E402
from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import Response  # noqa: E402
from pydantic import BaseModel  # noqa: E402
from typing import Optional  # noqa: E402

import engine  # noqa: E402
import separator  # noqa: E402
import structure  # noqa: E402
from dj_mix_v3 import SR  # noqa: E402

CACHE = "cache"
FEEDBACK = "feedback"          # feedback.jsonl + blends/<mix>.flac for every rated transition
os.makedirs(CACHE, exist_ok=True)
os.makedirs(os.path.join(FEEDBACK, "blends"), exist_ok=True)
app = FastAPI(title="yt-dj helper")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.middleware("http")
async def private_network(request, call_next):
    resp = await call_next(request)
    resp.headers["Access-Control-Allow-Private-Network"] = "true"
    return resp


dl_pool = ThreadPoolExecutor(max_workers=3, thread_name_prefix="dl")
cpu_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="cpu")     # tempo variants (no GPU)
mix_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="mix")
lock = threading.Lock()
tracks = {}     # (vid, rate) -> {"state", "future", "prio", "t0"}
jobs = {}       # pair key -> {"status", "plan", "flac", "error"}
MAX_LEN = 600   # longer than 10 min = jukebox / compilation, not a song

PRIO_NOW, PRIO_SOON, PRIO_PREFETCH = 0, 1, 2


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


class TooLong(Exception):
    def __init__(self, vid):
        self.vid = vid
        super().__init__(f"{vid} is longer than {MAX_LEN // 60} min")


# ------------------------------------------------------------------ GPU scheduler (priority, re-evaluated at pop time)
gpu_q, gpu_cv, _seq = [], threading.Condition(), iter(range(10 ** 9))


def gpu_submit(T, fn, *args):
    fut = Future()
    with gpu_cv:
        gpu_q.append((next(_seq), T, fn, args, fut)); gpu_cv.notify()
    return fut


def gpu_loop():
    while True:
        with gpu_cv:
            while not gpu_q:
                gpu_cv.wait()
            item = min(gpu_q, key=lambda e: (e[1]["prio"], e[0]))
            gpu_q.remove(item)
        _, T, fn, args, fut = item
        try:
            fut.set_result(fn(*args))
        except Exception as e:
            fut.set_exception(e)


threading.Thread(target=gpu_loop, daemon=True, name="gpu").start()


# ------------------------------------------------------------------ per-track pipeline
def download(vid):
    base = os.path.join(CACHE, f"{vid}.wav")
    if not os.path.exists(base):
        t = time.time()
        tmp = os.path.join(CACHE, f"{vid}.dl.wav")
        subprocess.run(["yt-dlp", "-q", "--no-warnings", "-f", "140/bestaudio[ext=m4a]/bestaudio", "--match-filter",
                        f"duration < {MAX_LEN}", "-x", "--audio-format", "wav", "--postprocessor-args", "-ar 44100 -ac 2",
                        "-o", os.path.join(CACHE, f"{vid}.dl.%(ext)s"), f"https://www.youtube.com/watch?v={vid}"], check=True)
        if not os.path.exists(tmp):
            raise TooLong(vid)
        os.replace(tmp, base)
        log(f"  downloaded {vid} in {time.time() - t:.1f}s")
    if sf.info(base).duration > MAX_LEN:
        raise TooLong(vid)
    return base


def rubberband(src, dst, rate):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af",
                    f"rubberband=tempo={rate:.5f}:pitch=1:transients=crisp:detector=compound:phase=laminar:"
                    f"window=standard:formant=preserved:pitchq=quality:channels=together", "-ar", "44100", dst], check=True)


def _gpu_prep(vid, path):
    T = tracks[(vid, 1.0)]
    from separator import separate_vocals
    T["state"] = "separating stems"
    t = time.time()
    separate_vocals(path)
    T["state"] = "allin1: finding sections" if structure.AVAILABLE else "analysing"
    engine.analysis(path)
    T["state"] = "ready"
    log(f"  prepped {vid} in {time.time() - t:.1f}s (prio {T['prio']})")
    return path


def _track_job(vid):
    T = tracks[(vid, 1.0)]
    T["state"] = "downloading"
    path = download(vid)
    T["state"] = "waiting for GPU"
    return gpu_submit(T, _gpu_prep, vid, path).result()


def _variant_job(vid, rate):
    """Tempo-matched copy built from the already-prepped original: stretch audio + vocal stem, re-run the
    5-second analysis. CPU only, never queues behind the GPU."""
    T = tracks[(vid, round(rate, 4))]
    T["state"] = "preparing original"
    base = track(vid, 1.0, T["prio"]).result()
    T["state"] = "tempo-matching"
    t = time.time()
    name = f"{vid}_r{rate:.4f}"
    out = os.path.join(CACHE, name + ".wav")
    voc_src = os.path.join("stems", "htdemucs", vid, "vocals.wav")
    voc_dst_dir = os.path.join("stems", "htdemucs", name)
    os.makedirs(voc_dst_dir, exist_ok=True)
    voc_dst = os.path.join(voc_dst_dir, "vocals.wav")
    th = threading.Thread(target=rubberband, args=(base, out, rate)) if not os.path.exists(out) else None
    if th:
        th.start()
    if not os.path.exists(voc_dst):
        rubberband(voc_src, voc_dst, rate)
    if th:
        th.join()
    if not os.path.exists(out):
        raise RuntimeError(f"tempo stretch failed for {vid}")
    engine.analysis(out)
    T["state"] = "ready"
    log(f"  tempo variant {vid} x{rate:.4f} in {time.time() - t:.1f}s")
    return out


def track(vid, rate=1.0, prio=PRIO_PREFETCH):
    """Future -> prepped audio path for (vid, rate). Asking again with a more urgent prio bumps it."""
    key = (vid, round(rate, 4))
    with lock:
        T = tracks.get(key)
        if T and T["future"].done() and T["future"].exception():
            T = None
        if not T:
            T = tracks[key] = {"state": "queued", "t0": time.time(), "prio": prio}
            T["future"] = (dl_pool.submit(_track_job, vid) if key[1] == 1.0
                           else cpu_pool.submit(_variant_job, vid, rate))
        T["prio"] = min(T["prio"], prio)
    if key[1] != 1.0:          # bump the original too
        base = tracks.get((vid, 1.0))
        if base:
            base["prio"] = min(base["prio"], prio)
    return T["future"]


# ------------------------------------------------------------------ pair jobs
def job_key(a, b, a_rate):
    return f"{a}|{b}|{a_rate:.4f}"


def run_job(key, a, b, a_rate, now, t_req):
    J = jobs[key]
    t0 = time.time()
    try:
        fa, fb = track(a, 1.0, PRIO_NOW), track(b, 1.0, PRIO_NOW)
        while not (fa.done() and fb.done()):
            sa, sb = tracks[(a, 1.0)]["state"], tracks[(b, 1.0)]["state"]
            J["status"] = f"now playing: {sa} · next: {sb}" if sa != "ready" else f"next track: {sb}"
            time.sleep(0.25)
        ap, bp = fa.result(), fb.result()
        J["status"] = "finding the mix point"
        # earliest mix point = where the playhead WILL be when this plan reaches the browser, + safety
        min_exit = now + (time.time() - t_req) * a_rate + 25
        plan, audio = engine.plan_and_render(ap, bp, a_rate=a_rate, min_exit=min_exit)
        buf = io.BytesIO()
        sf.write(buf, audio, SR, format="FLAC", subtype="PCM_16")
        J.update(status="ready", plan=plan, flac=buf.getvalue())
        log(f"{key} ready in {time.time() - t0:.1f}s: {plan['style']} drop at A {plan['drop_a_orig']:.1f}s -> B {plan['entry_b_orig']:.1f}s, k={plan['k']:.3f}")
    except TooLong as e:
        J.update(status="error", error=str(e), skip=e.vid); log(key, "skip:", e)
    except engine.NoTransition as e:
        J.update(status="error", error=str(e)); log(key, "no transition:", e)
    except Exception as e:
        traceback.print_exc()
        J.update(status="error", error=f"{type(e).__name__}: {e}")


class Prepare(BaseModel):
    a: str
    b: str
    a_rate: float = 1.0
    min_exit: float = 0.0
    now: float = 0.0


class Warm(BaseModel):
    ids: list[str]


@app.get("/health")
def health():
    return {"ok": True, "device": separator.DEV,
            "analyzer": f"allin1 ({structure.MODEL})" if structure.AVAILABLE else "librosa"}


@app.post("/warm")
def warm(w: Warm):
    for vid in w.ids[:6]:
        track(vid)
    return {k[0]: v["state"] for k, v in tracks.items() if k[0] in w.ids}


@app.post("/prepare")
def prepare(p: Prepare):
    key = job_key(p.a, p.b, p.a_rate)
    with lock:
        J = jobs.get(key)
        if J and J["status"] == "ready" and J["plan"]["file_start_a_orig"] < p.now + 3:
            J = None          # mix point already behind the playhead: re-plan
        if J and J["status"] == "error":
            J = None
        if not J:
            jobs[key] = J = {"status": "queued"}
            mix_pool.submit(run_job, key, p.a, p.b, p.a_rate, p.now, time.time())
    return {"key": key, "status": J["status"]}


@app.get("/plan")
def plan(a: str, b: str, a_rate: float = 1.0):
    J = jobs.get(job_key(a, b, a_rate))
    if not J:
        raise HTTPException(404, "not prepared")
    return {"status": J["status"], "plan": J.get("plan"), "error": J.get("error"), "skip": J.get("skip")}


@app.get("/blend")
def blend(a: str, b: str, a_rate: float = 1.0):
    J = jobs.get(job_key(a, b, a_rate))
    if not J or J["status"] != "ready":
        raise HTTPException(404, "not ready")
    return Response(J["flac"], media_type="audio/flac")


class Feedback(BaseModel):
    mix_id: str
    a: str
    b: str
    a_rate: float = 1.0
    rating: Optional[str] = None      # "up" | "down" | None (logged but unrated)
    tags: list[str] = []
    event: str = "rate"               # rate | mix_end | left_b
    plan: Optional[dict] = None       # the plan that actually played (client copy survives helper restarts)
    client: dict = {}


fb_lock = threading.Lock()


@app.post("/feedback")
def feedback(f: Feedback):
    """Append one line to feedback/feedback.jsonl. A mix can be logged several times (mix end, rating, tag
    changes, how long B was kept); analysis keeps the last line per mix_id. For rated mixes the exact
    rendered blend is kept next to it so it can be re-listened to and re-analysed."""
    rec = f.model_dump() if hasattr(f, "model_dump") else f.dict()
    rec["ts"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    rec["audio"] = {"a": os.path.join(CACHE, f"{f.a}.wav"), "b": os.path.join(CACHE, f"{f.b}.wav")}
    blend_file = os.path.join(FEEDBACK, "blends", re.sub(r"[^\w.-]", "_", f.mix_id) + ".flac")
    if f.rating and not os.path.exists(blend_file):
        J = jobs.get(job_key(f.a, f.b, f.a_rate))
        same = J and J.get("flac") and f.plan and abs(J["plan"]["file_start_a_orig"] - f.plan.get("file_start_a_orig", -1)) < 1e-3
        if same:
            with open(blend_file, "wb") as fh:
                fh.write(J["flac"])
    rec["blend_file"] = blend_file if os.path.exists(blend_file) else None
    with fb_lock, open(os.path.join(FEEDBACK, "feedback.jsonl"), "a", encoding="utf-8") as fh:
        fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    if f.event == "rate":
        log(f"feedback {f.rating or 'cleared'} {f.a} -> {f.b} {f.tags or ''}")
    return {"ok": True, "blend_saved": rec["blend_file"] is not None}


_art = {}


@app.get("/art/{vid}")
def art(vid: str):
    if vid in _art:
        return _art[vid]
    from PIL import Image
    try:
        raw = urllib.request.urlopen(f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg", timeout=10).read()
    except Exception:
        raise HTTPException(502, "thumbnail fetch failed")
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = im.size
    im = im.crop((0, int(h * 0.125), w, int(h * 0.875))).resize((96, 72))
    q = im.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:24]
    cols = []
    for cnt, idx in sorted(q.getcolors(), reverse=True):
        r, g, b = pal[idx * 3:idx * 3 + 3]
        mx, mn = max(r, g, b), min(r, g, b)
        cols.append({"hex": f"#{r:02x}{g:02x}{b:02x}", "sat": (mx - mn) / (mx + 1e-9),
                     "lum": (0.299 * r + 0.587 * g + 0.114 * b) / 255, "share": cnt})
    accent = max(cols, key=lambda c: c["sat"] * (0.4 + min(c["lum"], 0.75)) * (c["share"] ** 0.3))
    deep = min(cols, key=lambda c: c["lum"] - 0.3 * c["sat"])
    _art[vid] = {"accent": accent["hex"], "deep": deep["hex"], "palette": [c["hex"] for c in cols]}
    return _art[vid]


if __name__ == "__main__":
    import uvicorn
    log(f"loading Demucs on {separator.DEV}…")
    separator.warm()
    # compile librosa's JIT kernels now, not on the first real song
    import numpy as np, tempfile
    tmp = os.path.join(tempfile.gettempdir(), "ytdj_warm.wav")
    t = np.arange(SR * 20) / SR
    sf.write(tmp, (0.3 * np.sin(2 * np.pi * 110 * t) * (np.sin(2 * np.pi * 2 * t) > 0)).astype("float32"), SR)
    from fast_analysis import analyse_fast
    analyse_fast(tmp)
    if structure.AVAILABLE:     # load the allin1 model + its kernels once, now
        try:
            for f in ("struct/ytdj_warm.json",):
                if os.path.exists(f): os.remove(f)
            separator.separate_vocals(tmp); structure.analyse_structure(tmp)
        except Exception as e:
            log("allin1 warm-up failed:", e)
    log(f"analyzer: {'allin1 ' + structure.MODEL if structure.AVAILABLE else 'librosa'}")
    log("yt-dj helper ready on http://127.0.0.1:8765")
    uvicorn.run(app, host="127.0.0.1", port=8765, log_level="warning")
