"""
End-to-end check: JS spectrogram (test_spec.mjs -> out/jsspec/<vid>.f32) -> ONNX allin1 -> allin1 post-processing,
against the helper's results (poc/struct/<vid>.json). usage (repo root): poc/.venv/Scripts/python spike/allin1-onnx/check_chain.py
"""
import glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from export import np, torch, load_pretrained_model, postprocess_metrical_structure, postprocess_functional_structure  # noqa: E402
import onnxruntime as ort  # noqa: E402
cfg = load_pretrained_model("harmonix-fold0", device="cpu").cfg
sess = ort.InferenceSession(os.path.join(HERE, "out", "allin1_fold0.onnx"), providers=["CPUExecutionProvider"])


class O:
    def __init__(s, v):
        s.logits_beat, s.logits_downbeat, s.logits_section, s.logits_function, s.embeddings = (torch.from_numpy(x) for x in v)


ok = 0; files = sorted(glob.glob(os.path.join(HERE, "out", "jsspec", "*.f32")))
for p in files:
    vid = os.path.basename(p)[:-4]
    x = np.fromfile(p, dtype=np.float32).reshape(1, 4, -1, 81)
    o = O(sess.run(None, {"spec": x}))
    ms, fs = postprocess_metrical_structure(o, cfg), postprocess_functional_structure(o, cfg)
    ref = json.load(open(os.path.join("struct", vid + ".json")))
    same = (ms["beats"] == ref["beats"], ms["downbeats"] == ref["downbeats"],
            [(s.start, s.end, s.label) for s in fs] == [(s["start"], s["end"], s["label"]) for s in ref["segments"]])
    ok += all(same)
    print(vid, "beats", same[0], "downbeats", same[1], "sections", same[2])
print(f"{ok}/{len(files)} songs identical end to end")
