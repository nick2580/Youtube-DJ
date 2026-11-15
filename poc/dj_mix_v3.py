"""
yt-dj POC v3 — "be the DJ".

Principles
  * The incoming song (B) is NEVER pitch-shifted or time-stretched. After the blend it is the
    original audio, sample-for-sample (verified at the end).
  * Song A before the blend is untouched too. All manipulation happens inside the blend, and
    the heavy lifting (vocal removal, tempo nudges, level matching) is done on the OUTGOING song.
  * Key clashes are handled with a 3-band EQ blend (highs in early, bass swap mid-way,
    mids — where vocals and chords live — cross last) instead of pitch-shifting.
  * Vocal activity comes from Demucs stems: the blend is placed so A's singer finishes before
    B's singer starts, and A's vocal stem is pulled out at a natural phrase gap.

Usage:  python dj_mix_v3.py audio/A.wav audio/B.wav [--out out_v3]
"""
import argparse, json, os, subprocess, sys
import numpy as np
import librosa
import soundfile as sf
from scipy.signal import butter, sosfiltfilt

from dj_mix import analyse, camelot_score, tempo_ratio, cos, smooth, last_loud_bar, mmss, PHRASE_BARS

SR = 44100
LOW_HZ, HIGH_HZ = 180, 3000


# ---------------------------------------------------------------- stems (cached)
def stems(path, root="stems"):
    name = os.path.splitext(os.path.basename(path))[0]
    d = os.path.join(root, "htdemucs", name)
    voc = os.path.join(d, "vocals.wav")
    if not os.path.exists(voc):
        print(f"  separating vocals with Demucs ({name})…")
        import torch
        dev = "cuda" if torch.cuda.is_available() else "cpu"
        subprocess.run([sys.executable, "-m", "demucs", "--two-stems", "vocals", "-n", "htdemucs",
                        "-d", dev, "-o", root, path], check=True)
    v, _ = librosa.load(voc, sr=SR, mono=False)
    return v.T


def vocal_per_bar(voc, bar_t, dur):
    mono = voc.mean(axis=1)
    edges = list((np.asarray(bar_t) * SR).astype(int)) + [int(dur * SR)]
    r = np.array([np.sqrt(np.mean(mono[a:max(b, a + 1)] ** 2)) for a, b in zip(edges[:-1], edges[1:])])
    r = r / (np.percentile(r, 95) + 1e-9)
    # gate: below ~ -26 dB of a loud vocal bar = not singing
    return np.clip((r - 0.05) / 0.5, 0, 1)


# ---------------------------------------------------------------- blend curves (t in [0, 1])
def curves(t, vcut=0.45):
    t = np.asarray(t, dtype=float)
    tail = 1 - smooth(t, 0.82, 1.0)                    # A fully gone at the end
    return {
        "B_high": smooth(t, 0.0, 0.35),
        "B_low": smooth(t, 0.46, 0.56),                # ~1-bar bass swap
        "B_mid": smooth(t, 0.50, 0.80),
        "A_high": (1 - smooth(t, 0.55, 0.90)) * tail,
        "A_low": (1 - smooth(t, 0.46, 0.56)) * tail,
        "A_mid": (1 - smooth(t, 0.45, 0.78)) * tail,
        "A_vox": 1 - smooth(t, vcut - 0.06, vcut + 0.06),  # A's singer pulled at a phrase gap
    }


# ---------------------------------------------------------------- transition search
def find_transition(A, B, vA_bar, vB_bar, mix_bars_options=(8, 12, 16, 24)):
    nA, nB = len(A["bars"]), len(B["bars"])
    secA, secB = set(A["sections"]), set(B["sections"])
    endA = last_loud_bar(A)
    out = []
    for L in mix_bars_options:
        tb = (np.arange(L) + 0.5) / L
        cv = curves(tb)
        for i in range(int(nA * 0.5), nA - L):
            vA = vA_bar[i:i + L]
            # where can we pull A's vocal? the quietest vocal bar in the first ~60% of the blend
            win = slice(int(L * 0.25), max(int(L * 0.6), int(L * 0.25) + 1))
            k = int(np.argmin(vA[win])) + win.start
            vcut = (k + 0.5) / L
            cut_pen = float(vA[k])                         # >0 means we chop A mid-phrase
            gAv = curves(tb, vcut)["A_vox"] * np.maximum(cv["A_mid"], 0.0)
            eA_pre = np.mean([b["rms_n"] for b in A["bars"][max(0, i - 4):i]])
            ov_end = i + L
            fade_pen = max(0, ov_end - endA - 2) / 4
            early_pen = max(0, endA - ov_end) / nA * 4
            for j in range(0, int(nB * 0.6)):
                if j + L + 4 >= nB:
                    break
                vB = vB_bar[j:j + L]
                gBv = cv["B_mid"]
                clash = float(np.sum(vA * gAv * vB * gBv) / L * 4)
                # B's singer half-audible (mids partly open) sounds wrong — prefer B vocals to start when mids are open
                half_vox = float(np.mean(vB * (cv["B_mid"] > 0.05) * (cv["B_mid"] < 0.7)))
                # B vocal starting right after the blend is great ("drop the vocal in")
                arrive_vox = float(np.mean(vB_bar[j + L:j + L + 2]))
                # harmonic clash where both are tonally loud (mid bands overlap)
                both_mid = cv["A_mid"] * cv["B_mid"] + 0.3 * cv["A_mid"] * cv["B_high"]
                harm_bars = np.array([cos(A["bars"][i + n]["chroma"], B["bars"][j + n]["chroma"]) for n in range(L)])
                harm = float(np.sum(harm_bars * both_mid) / (both_mid.sum() + 1e-9))
                eB_post = np.mean([b["rms_n"] for b in B["bars"][j + L:j + L + 4]])
                energy = 1 - min(1, abs(eA_pre - eB_post) * 2)
                timbre = cos(np.mean([b["mfcc"] for b in A["bars"][i:i + L]], axis=0),
                             np.mean([b["mfcc"] for b in B["bars"][j:j + L]], axis=0))
                struct = (0.5 if (i in secA or (i - A["sections"][0]) % PHRASE_BARS == 0) else 0) \
                       + (0.5 if (j in secB or j % PHRASE_BARS == 0) else 0)
                arrive = 0.6 if any(abs((j + L) - s_) <= 1 for s_ in secB) else 0
                score = (-4.0 * clash - 1.5 * half_vox - 1.2 * cut_pen
                         + 0.4 * arrive_vox + arrive
                         + 1.2 * harm + 1.0 * energy + 0.4 * timbre + 0.8 * struct
                         - 2.0 * fade_pen - 1.0 * early_pen - 0.4 * (j / nB) + 0.025 * L)
                out.append(dict(score=score, i=i, j=j, L=L, vcut=vcut, clash=clash, half_vox=half_vox,
                                cut_pen=cut_pen, harm=harm, energy=energy, struct=struct, arrive=arrive,
                                arrive_vox=arrive_vox, endA=endA))
    out.sort(key=lambda c: -c["score"])
    return out


# ---------------------------------------------------------------- render helpers
def bands(x):
    lo = sosfiltfilt(butter(4, LOW_HZ, "lowpass", fs=SR, output="sos"), x, axis=0)
    hi = sosfiltfilt(butter(4, HIGH_HZ, "highpass", fs=SR, output="sos"), x, axis=0)
    return lo, x - lo - hi, hi                       # sums back to x exactly


def onset_env(x):
    return librosa.onset.onset_strength(y=x.mean(axis=1), sr=SR, hop_length=128)


def fine_align(ya, yb, a0, b0, max_ms=60, win_s=10):
    """Shift B's start by up to ±max_ms so its transients line up with A's."""
    ea = onset_env(ya[a0:a0 + int(win_s * SR)])
    eb = onset_env(yb[b0:b0 + int(win_s * SR)])
    n = min(len(ea), len(eb))
    ea, eb = ea[:n] - ea[:n].mean(), eb[:n] - eb[:n].mean()
    max_lag = int(max_ms / 1000 * SR / 128)
    lags = range(-max_lag, max_lag + 1)
    xc = [np.dot(ea[max(0, l):n + min(0, l)], eb[max(0, -l):n - max(0, l)]) for l in lags]
    lag = list(lags)[int(np.argmax(xc))]
    return b0 - lag * 128, lag * 128 / SR * 1000


def soft_limit(x, thr=0.95):
    a = np.abs(x)
    over = a > thr
    y = x.copy()
    y[over] = np.sign(x[over]) * (thr + (1 - thr) * np.tanh((a[over] - thr) / (1 - thr)))
    return y


def render(A, B, c, voc_a, out_prefix, pre_s=40, post_s=40):
    ya, _ = librosa.load(A["path"], sr=SR, mono=False); ya = ya.T
    yb, _ = librosa.load(B["path"], sr=SR, mono=False); yb = yb.T
    i, j, L = c["i"], c["j"], c["L"]
    a0 = int(A["bar_t"][i] * SR)
    a1 = int(A["bar_t"][i + L] * SR)
    n = a1 - a0
    b0, shift_ms = fine_align(ya, yb, a0, int(B["bar_t"][j] * SR))

    seg_a = ya[a0:a1]
    seg_b = yb[b0:b0 + n]
    seg_va = voc_a[a0:a1]
    if len(seg_va) < n:
        seg_va = np.pad(seg_va, ((0, n - len(seg_va)), (0, 0)))

    # level match: bring A toward B's loudness during the first 30% of the blend
    rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-9
    gain_target = float(np.clip(rms(yb[b0 + n:b0 + n + 8 * SR]) / rms(ya[max(0, a0 - 8 * SR):a0]), 0.6, 1.6))
    t = np.linspace(0, 1, n)
    cv = curves(t, c["vcut"])
    g_level = (1 + (gain_target - 1) * smooth(t, 0, 0.3))[:, None]

    a_lo, a_mid, a_hi = bands(seg_a)
    v_lo, v_mid, v_hi = bands(seg_va)
    b_lo, b_mid, b_hi = bands(seg_b)
    col = lambda k: cv[k][:, None]
    # A: band gains, minus the part of its vocal we pull out (exactly the original at t=0)
    pull = (1 - col("A_vox"))
    A_out = (col("A_low") * (a_lo - pull * v_lo) + col("A_mid") * (a_mid - pull * v_mid)
             + col("A_high") * (a_hi - pull * v_hi)) * g_level
    B_out = col("B_low") * b_lo + col("B_mid") * b_mid + col("B_high") * b_hi   # = seg_b exactly at t=1
    blend = soft_limit(A_out + B_out)

    full = np.concatenate([ya[:a0], blend, yb[b0 + n:]], axis=0)

    # ---- quality guarantee checks
    assert np.array_equal(full[:a0], ya[:a0]), "A before blend modified!"
    assert np.array_equal(full[a0 + n:], yb[b0 + n:]), "B after blend modified!"
    edge = np.abs(blend[-1] - yb[b0 + n - 1]).max()

    sf.write(out_prefix + "_full.wav", full, SR, subtype="FLOAT")
    ex0 = max(0, a0 - pre_s * SR); ex1 = min(len(full), a0 + n + post_s * SR)
    sf.write(out_prefix + "_excerpt.wav", full[ex0:ex1], SR)
    for nm in ("_full", "_excerpt"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out_prefix + nm + ".wav",
                        "-b:a", "320k", out_prefix + nm + ".mp3"], check=True)
    os.remove(out_prefix + "_excerpt.wav")
    return dict(blend_start=a0 / SR, blend_len=n / SR, b_entry=b0 / SR, fine_shift_ms=shift_ms,
                level_gain_A=gain_target, excerpt_blend_at=(a0 - ex0) / SR, end_seam_diff=float(edge))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a"); ap.add_argument("b"); ap.add_argument("--out", default="out_v3"); ap.add_argument("--pick", type=int, default=1)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    print("analysing…")
    A, B = analyse(args.a), analyse(args.b)
    voc_a, voc_b = stems(args.a), stems(args.b)
    vA_bar = vocal_per_bar(voc_a, A["bar_t"], A["dur"])
    vB_bar = vocal_per_bar(voc_b, B["bar_t"], B["dur"])

    rate, mult = tempo_ratio(A["tempo"], B["tempo"])
    for nm, S in (("A", A), ("B", B)):
        print(f"{nm}: {os.path.basename(S['path'])} {mmss(S['dur'])}  {S['tempo']:.1f} BPM  {S['key']['key']} ({S['key']['camelot']})")
    print(f"tempo ratio after half/triplet folding: {rate:.3f}  | key compat {camelot_score(A['key'], B['key']):.2f} (handled by 3-band EQ blend, no pitch shift)")
    if abs(rate - 1) > 0.03:
        print("  ! tempos differ >3% — v3 blends without beat-lock (A tempo-ramp is a TODO)")

    cands = find_transition(A, B, vA_bar, vB_bar)
    top, seen = [], set()
    for c in cands:
        key = (c["i"] // 4, c["j"] // 4)
        if key in seen:
            continue
        seen.add(key); top.append(c)
        if len(top) == 5:
            break
    print(f"A's last loud bar ≈ {mmss(A['bar_t'][top[0]['endA']])}")
    for n_, c in enumerate(top):
        print(f" #{n_ + 1} {c['score']:.2f} | blend A {mmss(A['bar_t'][c['i']])}–{mmss(A['bar_t'][c['i'] + c['L']])} "
              f"→ B from {mmss(B['bar_t'][c['j']])} ({c['L']} bars) | vox clash {c['clash']:.2f} "
              f"half-vox {c['half_vox']:.2f} cut {c['cut_pen']:.2f} harm {c['harm']:.2f} energy {c['energy']:.2f}")

    best = top[args.pick - 1]
    print(f"rendering #{args.pick}")
    info = render(A, B, best, voc_a, os.path.join(args.out, "mix"))
    print(f"\nblend: A {mmss(info['blend_start'])} for {info['blend_len']:.1f}s, B enters at {mmss(info['b_entry'])} "
          f"(fine-aligned {info['fine_shift_ms']:+.0f} ms), A level x{info['level_gain_A']:.2f}, "
          f"A vocal pulled at {best['vcut'] * 100:.0f}% of blend")
    print(f"✓ A before blend and B after blend are bit-identical to the originals (asserted). seam diff {info['end_seam_diff']:.4f}")
    print(f"✓ {args.out}/mix_excerpt.mp3 (blend starts at {mmss(info['excerpt_blend_at'])}), mix_full.mp3 + lossless mix_full.wav")
    json.dump({"best": {k: float(v) if isinstance(v, (float, np.floating)) else v for k, v in best.items()},
               "render": info}, open(os.path.join(args.out, "report.json"), "w"), indent=2)


if __name__ == "__main__":
    main()
