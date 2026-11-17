"""
Export allin1 harmonix-fold0 to ONNX with a dynamic time axis, then validate.py checks it against PyTorch (in a fresh process: the
traced model object is not a reliable reference after torch.onnx.export).

The helper's natten_shim builds its neighbourhood indices from Python ints (and caches them), which the
tracer would bake in as constants for one song length. For export only, _axis is swapped for a version
built from tensor ops on L = q.size(2), so the gather indices follow the input length.
dinat's own padding branches only fire when a song is shorter than one attention window (never for songs),
so tracing with a long input is enough for them.

usage (repo root): poc/.venv/Scripts/python spike/allin1-onnx/export.py
writes spike/allin1-onnx/out/allin1_fold0.onnx
"""
import glob, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
POC = os.path.join(HERE, "..", "..", "poc")
sys.path.insert(0, POC); os.chdir(POC)
import numpy as np, torch  # noqa: E402
import natten.functional as NF  # noqa: E402  (the helper's pure-PyTorch shim)
from allin1.models.loaders import load_pretrained_model  # noqa: E402
from allin1.postprocessing import postprocess_metrical_structure, postprocess_functional_structure  # noqa: E402

eager_axis = NF._axis


def traced_axis(L, K, d, device):
    """Same as natten_shim._axis, from tensor ops only. L may be a traced size."""
    L = torch.as_tensor(L, device=device)
    i = torch.arange(L, device=device)
    r, p = i % d, torch.div(i, d, rounding_mode="floor")
    Ld = torch.div(L - r + d - 1, d, rounding_mode="floor")
    nb = K // 2
    start = torch.minimum(torch.clamp(p - nb, min=0), torch.clamp(Ld - K, min=0))
    q = start[:, None] + torch.arange(K, device=device)[None, :]
    idx = r[:, None] + q * d
    valid = q < Ld[:, None]
    rel = (q - p[:, None]) + K - 1
    return torch.minimum(idx, L - 1), rel.clamp(0, 2 * K - 2), valid


class W(torch.nn.Module):
    def __init__(s, m):
        super().__init__(); s.m = m

    def forward(s, spec):
        o = s.m(spec)
        return o.logits_beat, o.logits_downbeat, o.logits_section, o.logits_function, o.embeddings


OUTS = ["beat", "downbeat", "section", "function", "emb"]

if __name__ == "__main__":
    m = load_pretrained_model("harmonix-fold0", device="cpu").eval()
    out = os.path.join(HERE, "out", "allin1_fold0.onnx"); os.makedirs(os.path.dirname(out), exist_ok=True)
    NF._axis = traced_axis
    # sanity: the traced version gives the shim's exact indices
    for L, K, d in [(97, 5, 3), (1000, 5, 32), (20, 7, 1)]:
        a, b = eager_axis(L, K, d, "cpu"), traced_axis(L, K, d, "cpu")
        assert all(torch.equal(x, y) for x, y in zip(a, b)), (L, K, d)
    x = torch.from_numpy(np.load(sorted(glob.glob("struct/spec/*.npy"))[0])).unsqueeze(0)[:, :, :18000]
    with torch.no_grad():
        torch.onnx.export(W(m), (x,), out, opset_version=17, dynamo=False, input_names=["spec"], output_names=OUTS,
                          dynamic_axes={"spec": {2: "T"}, **{n: {(1 if n == "beat" or n == "downbeat" or n == "section" else 2): "T"} for n in OUTS}})
    NF._axis = eager_axis
    print("exported", out, round(os.path.getsize(out) / 1e6, 2), "MB")

    print("validate in a fresh process: poc/.venv/Scripts/python spike/allin1-onnx/validate.py")
