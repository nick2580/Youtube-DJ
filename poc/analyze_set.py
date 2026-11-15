"""
Reverse-engineer a DJ set: find song changes and measure HOW each one was done.

Usage: python analyze_set.py ref/set_mono22k.wav [--vocals stems/htdemucs/set/vocals.wav] [--out ref/set_report.json]
"""
import argparse, json
import numpy as np
import librosa
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks

from dj_mix import detect_key, mmss

SR = 22050
HOP = 2048                 # ~93 ms frames
FPS = SR / HOP


def db(x):
    return 20 * np.log10(np.maximum(x, 1e-9))


def tempo_curve(onset, win_s=20, step_s=5):
    hop_on = 512
    fps_on = SR / hop_on
    w, st = int(win_s * fps_on), int(step_s * fps_on)
    out = []
    for k in range(0, len(onset) - w, st):
        tg = librosa.autocorrelate(onset[k:k + w] - onset[k:k + w].mean())
        lags = np.arange(len(tg)) / fps_on
        bpm = np.where(lags > 0, 60 / np.maximum(lags, 1e-9), 0)
        m = (bpm >= 85) & (bpm <= 175)
        best = bpm[m][np.argmax(tg[m])]
        out.append(((k + w / 2) / fps_on, float(best)))
    return np.array(out)


def checkerboard_novelty(F, L):
    """Foote novelty on a (dims, T) feature matrix with kernel half-size L frames."""
    F = librosa.util.normalize(F, axis=0)
    T = F.shape[1]
    nov = np.zeros(T)
    g = np.outer(np.hanning(2 * L), np.hanning(2 * L))
    sign = np.ones((2 * L, 2 * L)); sign[:L, L:] = -1; sign[L:, :L] = -1
    K = g * sign
    for t in range(L, T - L):
        X = F[:, t - L:t + L]
        S = X.T @ X
        nov[t] = np.sum(S * K)
    nov = np.maximum(nov, 0)
    return nov / (nov.max() + 1e-9)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio"); ap.add_argument("--vocals"); ap.add_argument("--out", default="ref/set_report.json")
    args = ap.parse_args()

    print("loading…")
    y, _ = librosa.load(args.audio, sr=SR, mono=True)
    print('NaN samples:', int(np.isnan(y).sum())); y = np.nan_to_num(y)
    dur = len(y) / SR
    print(f"set length {mmss(dur)}")

    S = np.abs(librosa.stft(y, n_fft=4096, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=SR, n_fft=4096)
    rms = db(np.sqrt((S ** 2).mean(axis=0)))
    low = db(S[(freqs > 30) & (freqs < 150)].sum(axis=0))
    mid = db(S[(freqs > 300) & (freqs < 3000)].sum(axis=0))
    high = db(S[freqs > 5000].sum(axis=0))
    cent = librosa.feature.spectral_centroid(S=S, sr=SR)[0]
    chroma = np.nan_to_num(librosa.feature.chroma_stft(S=S ** 2, sr=SR)) + 1e-6
    mfcc = librosa.feature.mfcc(S=librosa.power_to_db(librosa.feature.melspectrogram(S=S ** 2, sr=SR)), n_mfcc=13)

    onset = librosa.onset.onset_strength(y=y, sr=SR, hop_length=512)
    tc = tempo_curve(onset)

    voc = None
    if args.vocals:
        v, _ = librosa.load(args.vocals, sr=SR, mono=True)
        vr = librosa.feature.rms(y=v, frame_length=4096, hop_length=HOP)[0][:S.shape[1]]
        voc = db(vr / (np.percentile(vr, 95) + 1e-9))
        voc = uniform_filter1d(voc, 3)

    # ---- song boundaries: novelty on 1 s pooled chroma+mfcc with a ~24 s kernel
    pool = int(FPS)
    T = S.shape[1] // pool
    P = lambda M: M[:, :T * pool].reshape(M.shape[0], T, pool).mean(axis=2)
    F = np.vstack([P(chroma) * 2, librosa.util.normalize(P(mfcc), axis=1)])
    nov = checkerboard_novelty(F, L=12)
    peaks, props = find_peaks(nov, distance=50, prominence=0.08)
    bounds = [int(round(p * pool / FPS)) for p in peaks]          # pooled frames -> seconds
    nov_at = {b: float(nov[p]) for b, p in zip(bounds, peaks)}
    print(f"detected {len(bounds)} song changes (≈ one every {dur / (len(bounds) + 1):.0f}s)")

    def seg(t0, t1, arr):
        a, b = int(max(0, t0) * FPS), int(min(dur, t1) * FPS)
        return arr[a:b] if b > a else arr[a:a + 1]

    def key_of(t0, t1):
        m = np.nan_to_num(seg(t0, t1, chroma.T).mean(axis=0))
        return detect_key(m) if m.std() > 1e-6 else {'key': '?', 'camelot': '?'}

    def bpm_at(t0, t1):
        m = (tc[:, 0] >= t0) & (tc[:, 0] <= t1)
        return float(np.median(tc[m, 1])) if m.any() else float("nan")

    rows = []
    edges = [0] + bounds + [int(dur)]
    for n, b in enumerate(bounds):
        prev_len = b - edges[n]; next_len = edges[n + 2] - b
        W = 24
        pre, post = (b - W, b - 8), (b + 8, b + W)
        # profiles around the boundary, 1 s resolution
        prof = lambda arr: np.array([np.mean(seg(b + k, b + k + 1, arr)) for k in range(-W, W)])
        p_rms, p_low, p_high, p_mid, p_cent = prof(rms), prof(low), prof(high), prof(mid), prof(cent)
        base_rms = np.median(p_rms[:16]); base_low = np.median(p_low[:16]); base_high = np.median(p_high[:16])
        win = slice(W - 12, W + 12)
        rms_dip = float(base_rms - p_rms[win].min())
        low_dip = float(base_low - p_low[win].min())
        high_dip = float(base_high - p_high[win].min())
        # how long the bass was out (frames 1 s) — EQ bass-swap or bass-cut
        bass_out = int(np.sum(p_low[win] < base_low - 8))
        cent_min = float(p_cent[win].min() / (np.median(p_cent[:16]) + 1e-9))
        # crossover width: chroma similarity to 'before' and 'after' templates
        cb, ca = seg(*pre, chroma.T).mean(axis=0), seg(*post, chroma.T).mean(axis=0)
        sim_b = np.array([np.dot(seg(b + k, b + k + 1, chroma.T).mean(axis=0), cb) /
                          (np.linalg.norm(cb) * np.linalg.norm(seg(b + k, b + k + 1, chroma.T).mean(axis=0)) + 1e-9) for k in range(-W, W)])
        sim_a = np.array([np.dot(seg(b + k, b + k + 1, chroma.T).mean(axis=0), ca) /
                          (np.linalg.norm(ca) * np.linalg.norm(seg(b + k, b + k + 1, chroma.T).mean(axis=0)) + 1e-9) for k in range(-W, W)])
        mixed = (sim_b > 0.75) & (sim_a > 0.75) & (np.abs(sim_b - sim_a) < 0.15)
        overlap_s = int(np.sum(mixed[W - 16:W + 16]))
        kb, ka = key_of(b - 30, b - 4), key_of(b + 4, b + 30)
        tb, ta = bpm_at(b - 30, b - 4), bpm_at(b + 4, b + 30)
        r = dict(t=b, at=mmss(b), prev_len=prev_len, next_len=next_len,
                 bpm_before=tb, bpm_after=ta, key_before=kb["key"], key_after=ka["key"],
                 cam_before=kb["camelot"], cam_after=ka["camelot"],
                 rms_dip_db=rms_dip, bass_dip_db=low_dip, high_dip_db=high_dip, bass_out_s=bass_out,
                 centroid_min_ratio=cent_min, overlap_s=overlap_s, novelty=nov_at[b])
        if voc is not None:
            pv = prof(voc)
            on = pv > -22
            r["vox_before_s"] = int(on[W - 8:W].sum())          # vocals in the 8 s before the switch
            r["vox_after_s"] = int(on[W:W + 8].sum())
            r["vox_gap_s"] = int((~on[W - 4:W + 4]).sum())       # vocal silence right around the switch
            r["vox_profile"] = "".join("V" if x else "." for x in on[W - 12:W + 12])
        r["energy_profile"] = "".join(" .:-=+*#%@"[int(np.clip((x - base_rms + 18) / 2, 0, 9))] for x in p_rms[W - 12:W + 12])
        r["bass_profile"] = "".join(" .:-=+*#%@"[int(np.clip((x - base_low + 18) / 2, 0, 9))] for x in p_low[W - 12:W + 12])
        rows.append(r)

    # ---- summary
    print(f"\ntempo: median {np.median(tc[:, 1]):.1f} BPM, 10–90% range {np.percentile(tc[:, 1], 10):.0f}–{np.percentile(tc[:, 1], 90):.0f}")
    print(f"song length in the set: median {np.median(np.diff(edges)):.0f}s, min {np.min(np.diff(edges))}s, max {np.max(np.diff(edges))}s")
    print("\n  #   at     len | BPM b→a     | key b→a           | rmsdip bassdip bass-out | overlap | vocals (-12s..+12s)        | energy (-12..+12)        | bass")
    for n, r in enumerate(rows):
        print(f" {n + 1:2d} {r['at']:>7} {r['prev_len']:4d}s | {r['bpm_before']:5.1f}→{r['bpm_after']:5.1f} | "
              f"{r['cam_before']:>3}→{r['cam_after']:<3} {r['key_before']:>6}→{r['key_after']:<6} | "
              f"{r['rms_dip_db']:5.1f} {r['bass_dip_db']:6.1f} {r['bass_out_s']:5d}s   | {r['overlap_s']:4d}s   | "
              f"{r.get('vox_profile', ''):24s} | {r['energy_profile']:24s} | {r['bass_profile']}")
    json.dump(dict(dur=dur, tempo_curve=tc.tolist(), boundaries=rows), open(args.out, "w"), indent=1, default=float)
    print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
