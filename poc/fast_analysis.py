"""
Fast track analysis (seconds, not minutes) — same fields the v7 engine needs as dj_mix.analyse:
tempo, beat_t, bar_t, bars[{t, rms_n, chroma, mfcc}], key, sections, dur, path.
One STFT feeds chroma, MFCC and RMS; no REPET vocal separation (Demucs handles vocals).
"""
import numpy as np
import librosa

from dj_mix import detect_key, BEATS_PER_BAR

SR_AN = 22050
HOP = 512


def analyse_fast(path, struct=None):
    y, _ = librosa.load(path, sr=SR_AN, mono=True, res_type="soxr_qq")
    dur = len(y) / SR_AN
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=SR_AN, n_fft=2048)
    if struct and len(struct.get("downbeats", [])) > 4:
        # allin1: neural beats + downbeats (true bar starts)
        beat_t = np.asarray(struct["beats"], dtype=float)
        bar_t = np.asarray(struct["downbeats"], dtype=float)
        tempo = float(60.0 / np.median(np.diff(beat_t))) if len(beat_t) > 8 else float(struct["bpm"])
        bar_beats = np.clip(librosa.time_to_frames(bar_t, sr=SR_AN, hop_length=HOP), 0, S.shape[1] - 1)
        phase = 0
    else:
        onset_env = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S, ref=np.max), sr=SR_AN)
        tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=SR_AN, hop_length=HOP, tightness=100)
        tempo = float(np.atleast_1d(tempo)[0])
        beat_t = librosa.frames_to_time(beats, sr=SR_AN, hop_length=HOP)
        low = S[freqs < 150].sum(axis=0); low = low / (low.max() + 1e-9)
        acc = onset_env / (onset_env.max() + 1e-9) + low[: len(onset_env)]
        phase = int(np.argmax([acc[beats[k::BEATS_PER_BAR]].mean() for k in range(BEATS_PER_BAR)]))
        bar_beats = beats[phase::BEATS_PER_BAR]
        bar_t = librosa.frames_to_time(bar_beats, sr=SR_AN, hop_length=HOP)

    power = S ** 2
    chroma = librosa.feature.chroma_stft(S=power, sr=SR_AN, n_fft=2048)
    mfcc = librosa.feature.mfcc(S=librosa.power_to_db(librosa.feature.melspectrogram(S=power, sr=SR_AN)), n_mfcc=13)
    rms = librosa.feature.rms(S=S)[0]

    edges = list(bar_beats) + [S.shape[1]]
    bars = []
    for i in range(len(bar_beats)):
        a, b = edges[i], max(edges[i + 1], edges[i] + 1)
        bars.append({"t": float(bar_t[i]), "rms": float(rms[a:b].mean()),
                     "chroma": chroma[:, a:b].mean(axis=1), "mfcc": mfcc[:, a:b].mean(axis=1)})
    r = np.array([b["rms"] for b in bars]); r = r / (r.max() + 1e-9)
    for b, v in zip(bars, r):
        b["rms_n"] = float(v); b["vox_n"] = 0.0
    feats = np.vstack([np.array([b["chroma"] for b in bars]).T,
                       librosa.util.normalize(np.array([b["mfcc"] for b in bars]).T, axis=1)])
    k = max(4, min(12, len(bars) // 12))
    sections = sorted(set(int(s) for s in librosa.segment.agglomerative(feats, k)))
    return dict(path=path, dur=dur, tempo=tempo, beat_t=beat_t, bar_t=bar_t, bars=bars,
                key=detect_key(np.nan_to_num(chroma.mean(axis=1))), sections=sections, downbeat_phase=phase,
                segments=(struct or {}).get("segments", []), analyzer="allin1" if struct else "librosa")
