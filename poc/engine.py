"""
yt-dj engine: plan + render one transition for the extension (v7 logic).

Output audio file layout (all at the session tempo):
    [ pre_roll s of A, untouched ][ blend ][ tail s of B, untouched (tempo-matched) ]
The extension switches YouTube's audio to this file during the pre-roll (identical content, inaudible),
and back to YouTube's B video during the tail (again identical content).
"""
import os, pickle
import numpy as np
import librosa

from dj_mix import analyse, camelot_score, tempo_ratio, smooth
from dj_mix_v3 import stems, bands, fine_align, soft_limit, SR
from dj_mix_v5 import vocal_activity
from dj_mix_v7 import find_transition, echo_tail, tempo_match, MAX_STRETCH


class NoTransition(Exception):
    pass


def analysis(path):
    from fast_analysis import analyse_fast
    import structure
    use_a1 = structure.AVAILABLE
    pkl = path + (".a1.pkl" if use_a1 else ".fast.pkl")
    if os.path.exists(pkl) and os.path.getmtime(pkl) > os.path.getmtime(path):
        return pickle.load(open(pkl, "rb"))
    struct = structure.analyse_structure(path) if use_a1 else None
    A = analyse_fast(path, struct)
    pickle.dump(A, open(pkl, "wb"))
    return A


def prep_track(path):
    """Everything per-track that a mix needs, cached: Demucs stems (warm GPU) + allin1 structure + analysis."""
    from separator import separate_vocals
    separate_vocals(path)
    return analysis(path)


def track_meta(S):
    return {"bpm": round(S["tempo"], 1), "key": S["key"]["key"], "camelot": S["key"]["camelot"], "dur": S["dur"],
            "analyzer": S.get("analyzer", "librosa"),
            "segments": [{"start": round(x["start"], 2), "end": round(x["end"], 2), "label": x["label"]}
                         for x in S.get("segments", []) if x["label"] not in ("start", "end")]}


def make_blend(A, B, c, style, ya, yb, voc_a, voc_b, k, diag=None):
    """Same DSP as dj_mix_v7.render, returns arrays + positions instead of writing files.
    diag (optional dict) receives the render-time numbers kept for feedback analysis."""
    beat = 60 / A["tempo"]; a_bar = 4 * beat
    beat_n = int(beat * SR)
    pre_bars, post_bars = (8, 4) if style in ("blend", "overlap") else (4, 2)
    hA = int(c["tH"] * SR)
    a0, a1 = hA - int(pre_bars * a_bar * SR), hA + int(post_bars * a_bar * SR)
    n = a1 - a0
    b0 = int(c["tH_B"] / k * SR) - (hA - a0)
    b0, shift_ms = fine_align(ya, yb, a0, b0, max_ms=40)
    h = (hA - a0) / n
    t = np.linspace(0, 1, n)

    seg_a, seg_b = ya[a0:a1], yb[b0:b0 + n]
    va = voc_a[a0:a1]
    vb = voc_b[b0:b0 + n] if len(voc_b) >= b0 + n else np.pad(voc_b[b0:], ((0, b0 + n - len(voc_b)), (0, 0)))
    a_lo, a_mid, a_hi = bands(seg_a); b_lo, b_mid, b_hi = bands(seg_b)
    va_lo, va_mid, va_hi = bands(va); vb_lo, vb_mid, vb_hi = bands(vb)

    rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-9
    g_target = float(np.clip(rms(yb[b0 + n:b0 + n + 8 * SR]) / rms(ya[max(0, a0 - 8 * SR):a0]), 0.75, 1.33))
    g_level = (1 + (g_target - 1) * smooth(t, 0, h))[:, None]
    if diag is not None:
        diag.update(align_shift_ms=float(shift_ms), gain_b_over_a=g_target, pre_bars=pre_bars, post_bars=post_bars)
    eps = 1.0 / n
    beat_f = beat / (n / SR)
    pull_b = (1 - smooth(t, h - 0.3 * beat_f, h))[:, None]
    hv = (c["tA"] * SR - a0) / n
    pull_a = smooth(t, hv + 0.25 * beat_f, hv + 0.75 * beat_f)[:, None]
    echo = None
    if style == "overlap":
        # both songs clearly audible together: B's music (vocal muted) under A's last lines, bass swaps on
        # B's first word, A's music (vocal pulled) keeps playing under B and fades over the last 4 bars
        post = 1 - h
        cv = {"B_high": 0.9 * smooth(t, 0.0, h * 0.5) + 0.1 * smooth(t, h - beat_f, h),
              "B_mid": 0.55 * smooth(t, 0.0, h * 0.75) + 0.45 * smooth(t, h - beat_f, h),
              "B_low": smooth(t, h - 0.5 * beat_f, h + 0.5 * beat_f),
              "A_low": 1 - smooth(t, h - 0.5 * beat_f, h + 0.5 * beat_f),
              "A_mid": 1 - smooth(t, h + 0.05 * post, h + 0.9 * post),
              "A_high": 1 - smooth(t, h + 0.25 * post, 1.0)}
        g0, g1 = max(0, hA - a0 - beat_n), hA - a0
        src = np.zeros_like(seg_a)
        src[g0:g1] = (va_mid + va_hi)[g0:g1] * np.hanning(2 * (g1 - g0))[g1 - g0:, None][::-1]
        echo = echo_tail(src, beat_n, fb=0.4, taps=5)[:n] * 0.5
        echo[:g1] = 0
    elif style == "blend":
        cv = {"B_high": smooth(t, 0.0, h * 0.7), "B_mid": 0.35 * smooth(t, 0, h * 0.6) + 0.65 * smooth(t, h - 2 * beat_f, h),
              "B_low": smooth(t, h - beat_f, h + beat_f), "A_low": 1 - smooth(t, h - beat_f, h + beat_f),
              "A_mid": 1 - smooth(t, h, 1.0), "A_high": 1 - smooth(t, h + 0.2 * (1 - h), 1.0)}
    else:
        bass_out = h - 8 * beat_f
        cv = {"B_high": 0.8 * smooth(t, 0.0, h * 0.8) + 0.2 * smooth(t, h - eps, h + eps),
              "B_mid": 0.3 * smooth(t, 0.0, h * 0.8) + 0.7 * smooth(t, h - 0.5 * beat_f, h),
              "B_low": smooth(t, h - 0.02 * beat_f, h + 0.02 * beat_f),
              "A_low": 1 - smooth(t, bass_out - 0.5 * beat_f, bass_out),
              "A_mid": 1 - smooth(t, h - 0.1 * beat_f, h + 0.25 * beat_f),
              "A_high": 1 - smooth(t, h - 0.1 * beat_f, h + 0.25 * beat_f)}
        g0, g1 = max(0, hA - a0 - beat_n), hA - a0
        src = np.zeros_like(seg_a)
        src[g0:g1] = (a_mid + a_hi)[g0:g1] * np.hanning(2 * (g1 - g0))[g1 - g0:, None][::-1]
        echo = echo_tail(src, beat_n)[:n] * 0.8
        echo[:g1] = 0
    col = lambda key: np.asarray(cv[key])[:, None]
    A_out = (col("A_low") * (a_lo - pull_a * va_lo) + col("A_mid") * (a_mid - pull_a * va_mid)
             + col("A_high") * (a_hi - pull_a * va_hi)) * g_level
    B_out = (col("B_low") * (b_lo - pull_b * vb_lo) + col("B_mid") * (b_mid - pull_b * vb_mid)
             + col("B_high") * (b_hi - pull_b * vb_hi))
    mix = A_out + B_out + (echo * g_level if echo is not None else 0)
    if diag is not None:
        peak = float(np.max(np.abs(mix)))
        diag.update(peak_before_limit=peak, limited=peak > 1.0)
    return soft_limit(mix), a0, n, b0, hA


def vocal_segments(voc, hop_s=0.02):
    """Singer segments split at BREATHS: short dips (>=0.18 s) where the voice falls ~9 dB below its own
    level over the surrounding 3 s. Finds line boundaries even in dense, reverb-heavy vocals."""
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    act, segs, db = vocal_activity(voc, merge_gap=0.2)
    d = uniform_filter1d(db, 5)
    dip = (d < maximum_filter1d(d, size=int(3 / hop_s)) - 9) | (d < -30)
    out = []
    for s0, s1 in segs:
        a, b = int(s0 / hop_s), int(s1 / hop_s)
        cur, k = a, a
        while k < b:
            if dip[k]:
                e = k
                while e < b and dip[e]:
                    e += 1
                if (e - k) * hop_s >= 0.18 and (k - cur) * hop_s >= 0.8:
                    out.append([cur * hop_s, k * hop_s]); cur = e
                k = e
            else:
                k += 1
        if (b - cur) * hop_s > 0.3:
            out.append([cur * hop_s, b * hop_s])
    return act, out, db


def scale_analysis(A, r):
    """A played at speed r: same musical content, times / r, tempo * r."""
    if abs(r - 1) < 1e-6:
        return A
    B = dict(A)
    B["tempo"] = A["tempo"] * r
    B["beat_t"] = np.asarray(A["beat_t"]) / r
    B["bar_t"] = np.asarray(A["bar_t"]) / r
    B["dur"] = A["dur"] / r
    B["bars"] = [dict(b, t=b["t"] / r) for b in A["bars"]]
    B["segments"] = [dict(x, start=x["start"] / r, end=x["end"] / r) for x in A.get("segments", [])]
    return B


def scale_vocals(act, segs, db, r):
    if abs(r - 1) < 1e-6:
        return act, segs, db
    idx = np.minimum((np.arange(int(len(act) / r)) * r).astype(int), len(act) - 1)
    return act[idx], [[s0 / r, s1 / r] for s0, s1 in segs], db[idx]


def load_window(path, t0, t1, r, total_len, fast=False):
    """Zero array of total_len samples holding path's audio at speed r, filled only for session time [t0, t1).
    Only this window goes through Rubber Band (seconds of audio instead of the whole song)."""
    import subprocess
    out = np.zeros((total_len, 2), dtype=np.float32)
    t0 = max(0.0, t0); pad = 0.5
    o0 = max(0.0, t0 * r - pad); o1 = t1 * r + pad
    if abs(r - 1) <= 1e-6:
        af = []
    elif fast:      # analysis-only signals (vocal stem): cheap WSOLA is plenty
        af = ["-af", f"atempo={r:.5f}"]
    else:
        af = ["-af", f"rubberband=tempo={r:.5f}:pitch=1:transients=crisp:detector=compound:phase=laminar:"
                     f"window=standard:formant=preserved:pitchq=quality:channels=together"]
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{o0:.4f}", "-t", f"{o1 - o0:.4f}", "-i", path, *af,
                          "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    seg = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
    start = int(round(o0 / r * SR))
    end = min(total_len, start + len(seg))
    out[start:end] = seg[:end - start]
    return out


def plan_and_render(a_path, b_path, a_rate=1.0, min_exit=0.0, pre_roll=8.0, tail=25.0, progress=lambda s: None):
    """a_path/b_path: ORIGINAL audio. A is currently playing at speed a_rate (session tempo).
    min_exit is in A's ORIGINAL timeline (what YouTube's currentTime reports)."""
    import os
    name = lambda p: os.path.splitext(os.path.basename(p))[0]
    voc_a_path = os.path.join("stems", "htdemucs", name(a_path), "vocals.wav")
    voc_b_path = os.path.join("stems", "htdemucs", name(b_path), "vocals.wav")
    voc_a0, voc_b0 = stems(a_path), stems(b_path)
    A = scale_analysis(analysis(a_path), a_rate)
    B0 = analysis(b_path)
    actA, segA, dbA = scale_vocals(*vocal_segments(voc_a0), a_rate)
    actB, segB, dbB = vocal_segments(voc_b0)

    rate, _ = tempo_ratio(A["tempo"], B0["tempo"])
    k = rate if abs(rate - 1) <= MAX_STRETCH else 1.0
    if abs(k - 1) < 0.003:
        k = 1.0
    style = "blend" if camelot_score(A["key"], B0["key"]) >= 0.85 else "overlap"

    min_exit_s = min_exit / a_rate
    every = find_transition(A, B0, actA, segA, dbA, actB, segB, dbB, k)
    cands = [c for c in every if c["tH"] - 8 * 240 / A["tempo"] - pre_roll >= min_exit_s]
    if not cands:
        raise NoTransition("no good mix point left in this song")
    c = cands[0]

    # session-time windows we actually need (stretch only those, all four in parallel)
    from concurrent.futures import ThreadPoolExecutor
    a_bar = 240 / A["tempo"]
    pre_bars = 8 if style in ("blend", "overlap") else 4
    hA_s = c["tH"]
    a_w0 = hA_s - pre_bars * a_bar - pre_roll - 8.5
    a_w1 = max(hA_s + 4 * a_bar, hA_s - pre_bars * a_bar + 10) + 1.0
    b_start_s = c["tH_B"] / k - pre_bars * a_bar
    b_w0 = b_start_s - 1.0
    b_w1 = c["tH_B"] / k + 4 * a_bar + tail + 9
    lenA = int(A["dur"] * SR) + SR
    lenB = int(B0["dur"] / k * SR) + SR
    with ThreadPoolExecutor(4) as ex:
        fa = ex.submit(load_window, a_path, a_w0, a_w1, a_rate, lenA)
        fva = ex.submit(load_window, voc_a_path, a_w0, a_w1, a_rate, lenA, True)
        fb = ex.submit(load_window, b_path, b_w0, b_w1, k, lenB)
        fvb = ex.submit(load_window, voc_b_path, b_w0, b_w1, k, lenB, True)
        ya, voc_a, yb, voc_b = fa.result(), fva.result(), fb.result(), fvb.result()

    diag = {}
    blend, a0, n, b0, hA = make_blend(A, B0, c, style, ya, yb, voc_a, voc_b, k, diag)
    p0 = a0 - int(pre_roll * SR)
    tail_n = min(int(tail * SR), int(B0["dur"] / k * SR) - (b0 + n))
    audio = np.concatenate([ya[p0:a0], blend, yb[b0 + n:b0 + n + tail_n]], axis=0).astype(np.float32)
    P = pre_roll
    plan = {
        "style": style, "k": k, "a_rate": a_rate,
        "a": track_meta(A) | {"bpm_session": round(A["tempo"], 1)},
        "b": track_meta(B0),
        "file_dur": len(audio) / SR, "blend_start": P, "drop": P + (hA - a0) / SR, "blend_end": P + n / SR,
        "file_start_a_orig": p0 / SR * a_rate,          # A: orig = file_start_a_orig + tau * a_rate
        "b_file_origin": (b0 - (a0 - p0)) / SR,          # B: orig = (b_file_origin + tau) * k
        "exit_a_orig": c["tA"] * a_rate, "drop_a_orig": c["tH"] * a_rate, "entry_b_orig": c["tH_B"],
        "exit_section": c.get("a_sec"), "entry_section": c.get("b_sec"),
        "diag": _jsonable(diag | {
            # why this transition: the inputs behind every decision the engine made, so a thumbs up/down
            # can be traced back to the score terms, the key/tempo calls and the render settings
            "engine": "v7", "analyzer_a": A.get("analyzer", "librosa"), "analyzer_b": B0.get("analyzer", "librosa"),
            "bpm_a_orig": A["tempo"] / a_rate, "bpm_b": B0["tempo"], "tempo_ratio": rate, "stretch_capped": k == 1.0 and abs(rate - 1) > MAX_STRETCH,
            "camelot_score": camelot_score(A["key"], B0["key"]), "key_a": A["key"], "key_b": B0["key"],
            "min_exit_orig": min_exit, "cands_total": len(every), "cands_after_min_exit": len(cands),
            "chosen": c, "chosen_rank_overall": every.index(c),
            "runners_up": [{key: x.get(key) for key in ("score", "tA", "tH", "tH_B", "a_sec", "b_sec", "harm", "level", "vox_match", "on_down")}
                           for x in cands[1:6]],
            "a_vox_segments_near_exit": [s for s in segA if c["tA"] - 20 <= s[1] and s[0] <= c["tH"] + 10],
            "b_vox_segments_near_entry": [s for s in segB if c["tH_B"] - 10 <= s[1] and s[0] <= c["tH_B"] + 20],
        }),
    }
    return plan, audio


def _jsonable(x):
    """numpy scalars/arrays and tuples -> plain JSON types (rounded floats keep the log small)."""
    if isinstance(x, dict):
        return {str(k): _jsonable(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [_jsonable(v) for v in x]
    if isinstance(x, np.ndarray):
        return _jsonable(x.tolist())
    if isinstance(x, (bool, np.bool_)):
        return bool(x)
    if isinstance(x, (int, np.integer)):
        return int(x)
    if isinstance(x, (float, np.floating)):
        return round(float(x), 4)
    return x
