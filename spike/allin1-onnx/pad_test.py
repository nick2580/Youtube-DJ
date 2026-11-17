"""
Can one fixed-length allin1 model serve every song? Run harmonix-fold0 on each cached spectrogram as is,
and again zero-padded to T_MAX frames (logits cropped back), then compare the post-processed beats,
downbeats and sections. Padding value: the log spectrogram of silence, log10(1 + 0) = 0.

usage (repo root): poc/.venv/Scripts/python spike/allin1-onnx/pad_test.py [T_MAX=48000] [n_songs=12]
"""
import glob, os, sys
POC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "poc")
sys.path.insert(0, POC); os.chdir(POC)
import numpy as np, torch  # noqa: E402
from allin1.models.loaders import load_pretrained_model  # noqa: E402
from allin1.postprocessing import postprocess_metrical_structure, postprocess_functional_structure  # noqa: E402

TMAX = int(sys.argv[1]) if len(sys.argv) > 1 else 48000
N = int(sys.argv[2]) if len(sys.argv) > 2 else 12
dev = "cuda" if torch.cuda.is_available() else "cpu"
m = load_pretrained_model("harmonix-fold0", device=dev).eval()


def post(lg):
    ms = postprocess_metrical_structure(lg, m.cfg)
    fs = postprocess_functional_structure(lg, m.cfg)
    return np.array(ms["beats"]), np.array(ms["downbeats"]), [(round(s.start, 2), round(s.end, 2), s.label) for s in fs]


def match(ref, est, tol=0.02):
    return float(np.mean([np.min(np.abs(est - t)) < tol for t in ref])) if len(ref) and len(est) else float("nan")


class Crop:     # same attribute surface as AllInOneOutput, time axis cropped
    def __init__(s, o, T):
        for k, v in vars(o).items():
            setattr(s, k, v[..., :T] if torch.is_tensor(v) and k.startswith("logits") else v)


tot = []
for p in sorted(glob.glob("struct/spec/*.npy"))[:N]:
    spec = torch.from_numpy(np.load(p)).unsqueeze(0).to(dev)
    T = spec.shape[2]
    if T > TMAX:
        print(os.path.basename(p), "longer than T_MAX, skipped"); continue
    with torch.no_grad():
        a = post(m(spec))
        pad = torch.zeros(1, 4, TMAX, spec.shape[3], device=dev); pad[:, :, :T] = spec
        b = post(Crop(m(pad), T))
    beats, downs = match(a[0], b[0]), match(a[1], b[1])
    same_secs = a[2] == b[2]
    lab = sum(1 for x, y in zip(a[2], b[2]) if x[2] == y[2] and abs(x[0] - y[0]) < 0.1) / max(len(a[2]), 1)
    tot.append((beats, downs, same_secs, lab))
    print(f"{os.path.basename(p)[:11]} {T/100:6.1f}s  beats {beats:.1%}  downbeats {downs:.1%}  sections identical {same_secs}  ({lab:.0%} of {len(a[2])} match)")
if tot:
    t = np.array(tot, dtype=float)
    print(f"\n{len(t)} songs padded to {TMAX/100:.0f} s: beats {t[:,0].mean():.2%}, downbeats {t[:,1].mean():.2%}, sections identical {int(t[:,2].sum())}/{len(t)}, section match {t[:,3].mean():.1%}")
