"""
Run the ONNX allin1 on cached spectrograms and write its logits as raw float32 for the JS post-processing
test (test_post.mjs), which compares against the helper's own allin1 results in poc/struct/<vid>.json.

usage (repo root): poc/.venv/Scripts/python spike/allin1-onnx/dump_logits.py [n_songs=30]
writes spike/allin1-onnx/out/logits/<vid>.<beat|downbeat|section|function>.f32
"""
import glob, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
POC = os.path.join(HERE, "..", "..", "poc"); os.chdir(POC)
import numpy as np, onnxruntime as ort  # noqa: E402

N = int(sys.argv[1]) if len(sys.argv) > 1 else 30
out = os.path.join(HERE, "out", "logits"); os.makedirs(out, exist_ok=True)
sess = ort.InferenceSession(os.path.join(HERE, "out", "allin1_fold0.onnx"), providers=["CPUExecutionProvider"])
names = [o.name for o in sess.get_outputs()]
for p in sorted(glob.glob("struct/spec/*.npy"))[:N]:
    vid = os.path.basename(p)[:-4]
    if not os.path.exists(f"struct/{vid}.json"):
        continue
    r = dict(zip(names, sess.run(None, {"spec": np.load(p)[None].astype(np.float32)})))
    for k in ("beat", "downbeat", "section", "function"):
        np.ascontiguousarray(r[k][0], dtype=np.float32).tofile(os.path.join(out, f"{vid}.{k}.f32"))
    print(vid, r["beat"].shape[-1], "frames")
