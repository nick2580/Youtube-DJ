import numpy as np, librosa
from dj_mix_v3 import stems, SR
from dj_mix_v5 import vocal_activity, HOP_S
for path in ("audio/FxAG_11PzCk.wav", "audio/GVizJ_jpUnw.wav"):
    y, _ = librosa.load(path, sr=SR, mono=True)
    act, segs, db = vocal_activity(stems(path))
    r = librosa.feature.rms(y=y, frame_length=4096, hop_length=int(HOP_S*SR))[0]
    rdb = 20*np.log10(r/(np.percentile(r,95))+1e-9)
    print("\n", path, " (time | mix loudness dB | vocal dB | vocal on%)  # = louder")
    step = int(6/HOP_S)
    for k in range(0, len(rdb), step):
        mix = np.mean(rdb[k:k+step]); vd = np.percentile(db[k:k+step], 75); on = act[k:k+step].mean()
        bar = "#" * max(0, int((mix + 20)))
        print(f" {int(k*HOP_S//60)}:{k*HOP_S%60:04.1f}  {mix:6.1f}  {vd:6.1f}  {on*100:3.0f}%  {bar}")
    print(" phrase segments:", " ".join(f"[{int(a//60)}:{a%60:04.1f}-{int(b//60)}:{b%60:04.1f}]" for a,b in segs))
