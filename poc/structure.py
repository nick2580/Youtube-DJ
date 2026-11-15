"""
Music structure via allin1 (mir-aidj/all-in-one): beats, downbeats, BPM and labelled sections
(intro / verse / chorus / bridge / solo / inst / outro). Single model (harmonix-fold0, ~5 s on GPU) and
reuses the Demucs stems our separator already wrote (stems/htdemucs/<name>/*.wav). Cached as JSON.
"""
import json, os, threading

MODEL = "harmonix-fold0"
_lock = threading.Lock()
AVAILABLE = True
try:
    import allin1  # noqa: F401
except Exception:      # keep the helper working without allin1
    AVAILABLE = False


def analyse_structure(path, stems_root="stems", out_dir="struct"):
    name = os.path.splitext(os.path.basename(path))[0]
    js = os.path.join(out_dir, f"{name}.json")
    if os.path.exists(js):
        return json.load(open(js))
    import allin1
    with _lock:
        r = allin1.analyze(path, out_dir=out_dir, demix_dir=stems_root, spec_dir=os.path.join(out_dir, "spec"),
                           device="cuda", keep_byproducts=True, multiprocess=False, model=MODEL)
    return {"bpm": r.bpm, "beats": list(r.beats), "downbeats": list(r.downbeats),
            "segments": [{"start": s.start, "end": s.end, "label": s.label} for s in r.segments]}


def label_at(segments, t):
    for s in segments:
        if s["start"] <= t < s["end"]:
            return s
    return None
