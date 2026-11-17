"""
Check the browser's vocals against the Python helper's Demucs vocals for the same song.

What matters is not bit-exactness but whether the mix logic would decide the same things, so besides
SDR this runs dj_mix_v5.vocal_activity (what the engine scores transitions with) on both and compares.

usage (from the repo root): poc/.venv/Scripts/python spike/demucs-webgpu/compare.py out/<vid>.<ep>...vocals.f32 [...]
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
POC = os.path.join(HERE, "..", "..", "poc")
sys.path.insert(0, POC)
import numpy as np, soundfile as sf  # noqa: E402
from dj_mix_v5 import vocal_activity  # noqa: E402


def sdr(ref, est):
    n = min(len(ref), len(est)); ref, est = ref[:n], est[:n]
    return 10 * np.log10((ref ** 2).sum() / (((ref - est) ** 2).sum() + 1e-12) + 1e-12)


for f in sys.argv[1:]:
    p = f if os.path.isabs(f) or os.path.exists(f) else os.path.join(HERE, f)
    vid = os.path.basename(p).split(".")[0]
    est = np.fromfile(p, dtype=np.float32).reshape(-1, 2)
    ref, sr = sf.read(os.path.join(POC, "stems", "htdemucs", vid, "vocals.wav"), dtype="float32")
    n = min(len(ref), len(est)); ref, est = ref[:n], est[:n]
    a_ref, s_ref, _ = vocal_activity(ref, merge_gap=0.2)
    a_est, s_est, _ = vocal_activity(est, merge_gap=0.2)
    m = min(len(a_ref), len(a_est))
    agree = float((a_ref[:m] == a_est[:m]).mean())
    # how far each reference vocal segment edge is from the nearest browser edge
    e_ref = np.array([x for s in s_ref for x in s]); e_est = np.array([x for s in s_est for x in s])
    edge = np.abs(e_ref[:, None] - e_est[None, :]).min(1) if len(e_ref) and len(e_est) else np.array([np.nan])
    r = {"file": os.path.basename(p), "secs": round(n / sr, 1), "sdr_db": round(float(sdr(ref, est)), 2),
         "activity_agree": round(agree, 4), "segments_ref": len(s_ref), "segments_browser": len(s_est),
         "edge_err_median_s": round(float(np.median(edge)), 3), "edge_err_p95_s": round(float(np.percentile(edge, 95)), 3)}
    print(json.dumps(r))
