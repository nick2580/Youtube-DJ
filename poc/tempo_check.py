import sys, numpy as np, librosa
for p in sys.argv[1:]:
    y, sr = librosa.load(p, sr=22050, mono=True)
    oe = librosa.onset.onset_strength(y=y, sr=sr)
    # autocorrelation tempogram -> global tempo strength
    tg = librosa.feature.tempogram(onset_envelope=oe, sr=sr)
    bpms = librosa.tempo_frequencies(tg.shape[0], sr=sr)
    g = tg.mean(axis=1)
    m = (bpms > 50) & (bpms < 200)
    idx = np.argsort(-g[m])
    cand = []
    for k in idx:
        b = bpms[m][k]
        if all(abs(b - c) / c > 0.04 for c, _ in cand): cand.append((b, g[m][k]))
        if len(cand) == 6: break
    priors = {pr: float(np.atleast_1d(librosa.beat.beat_track(onset_envelope=oe, sr=sr, start_bpm=pr)[0])[0]) for pr in (60, 80, 90, 120)}
    print(p, "autocorr peaks:", [(round(b,1), round(float(s),3)) for b, s in cand], "| beat_track by prior:", {k: round(v,1) for k,v in priors.items()})
