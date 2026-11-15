"""
Demucs vocal separation kept warm on the GPU (model loaded once per process).
Writes stems/htdemucs/<name>/vocals.wav — the same cache layout dj_mix_v3.stems() reads.
"""
import os, threading
import numpy as np
import soundfile as sf
import torch

_model, _lock = None, threading.Lock()
DEV = "cuda" if torch.cuda.is_available() else "cpu"


def _get_model():
    global _model
    if _model is None:
        from demucs.pretrained import get_model
        _model = get_model("htdemucs")
        _model.to(DEV).eval()
    return _model


STEMS = ("bass", "drums", "other", "vocals")


def separate_vocals(path, root="stems"):
    """One warm-GPU Demucs pass; writes all four stems (allin1 reuses them) and returns the vocals path."""
    name = os.path.splitext(os.path.basename(path))[0]
    out_dir = os.path.join(root, "htdemucs", name)
    out = os.path.join(out_dir, "vocals.wav")
    if all(os.path.exists(os.path.join(out_dir, f"{s}.wav")) for s in STEMS):
        return out
    from demucs.apply import apply_model
    wav, sr = sf.read(path, dtype="float32", always_2d=True)       # (n, ch) at 44.1 kHz
    x = torch.from_numpy(wav.T.copy())
    if x.shape[0] == 1:
        x = x.repeat(2, 1)
    ref = x.mean(0)
    mean, std = ref.mean(), ref.std() + 1e-8
    x = (x - mean) / std
    with _lock, torch.inference_mode():
        m = _get_model()
        src = apply_model(m, x[None].to(DEV), shifts=0, split=True, overlap=0.1, progress=False, device=DEV)[0]
        src = (src * std + mean).cpu().numpy()
    os.makedirs(out_dir, exist_ok=True)
    for i, s in enumerate(m.sources):
        sf.write(os.path.join(out_dir, f"{s}.wav"), src[i].T, sr, subtype="PCM_16")
    return out


def warm():
    with _lock:
        _get_model()
