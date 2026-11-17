"""
ONNX allin1 vs PyTorch allin1 on cached spectrograms (poc/struct/spec), compared after allin1's own
post-processing: beats, downbeats and labelled sections must come out identical.
usage (repo root): poc/.venv/Scripts/python spike/allin1-onnx/validate.py [n_songs=8]
"""
import glob, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from export import np, torch, load_pretrained_model, postprocess_metrical_structure, postprocess_functional_structure  # noqa: E402
m = load_pretrained_model("harmonix-fold0", device="cpu").eval()
out = os.path.join(HERE, "out", "allin1_fold0.onnx")
N = int(sys.argv[1]) if len(sys.argv) > 1 else 8
import onnxruntime as ort
sess = ort.InferenceSession(out, providers=["CPUExecutionProvider"])

class O:      # AllInOneOutput surface for the post-processors
    def __init__(s, vals):
        s.logits_beat, s.logits_downbeat, s.logits_section, s.logits_function, s.embeddings = (torch.from_numpy(v) for v in vals)

def post(o):
    ms = postprocess_metrical_structure(o, m.cfg); fs = postprocess_functional_structure(o, m.cfg)
    return ms["beats"], ms["downbeats"], [(round(s.start, 2), round(s.end, 2), s.label) for s in fs]

for p in sorted(glob.glob("struct/spec/*.npy"))[:N]:
    spec = torch.from_numpy(np.load(p)).unsqueeze(0)
    with torch.no_grad():
        ref = m(spec)
    got = sess.run(None, {"spec": spec.numpy()})
    diff = max(float(np.abs(g - r.numpy()).max()) for g, r in zip(got, (ref.logits_beat, ref.logits_downbeat, ref.logits_section, ref.logits_function, ref.embeddings)))
    a, b = post(ref), post(O(got))
    print(f"{os.path.basename(p)[:11]} T={spec.shape[2]:6d}  max|logit diff| {diff:.2e}  beats same {a[0] == b[0]}  downbeats same {a[1] == b[1]}  sections same {a[2] == b[2]}")
