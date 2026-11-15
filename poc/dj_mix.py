"""
yt-dj POC: analyse two songs, pick the best transition (exit point in A, entry point in B),
beat-match, and render a DJ-style mix.

Usage:  python dj_mix.py audio/A.wav audio/B.wav  [--out out]
"""
import argparse, json, os, subprocess
import numpy as np
import librosa
import soundfile as sf
from scipy.signal import butter, sosfiltfilt

SR_AN = 22050          # analysis sample rate
SR_OUT = 44100         # render sample rate
HOP = 512
BEATS_PER_BAR = 4
PHRASE_BARS = 8        # phrases are usually 8 bars in pop / Bollywood

# ---------------------------------------------------------------- key detection
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
# Camelot wheel number for major keys indexed by pitch class; minor = relative minor
CAMELOT_MAJ = {0: 8, 7: 9, 2: 10, 9: 11, 4: 12, 11: 1, 6: 2, 1: 3, 8: 4, 3: 5, 10: 6, 5: 7}


def detect_key(chroma_mean):
    best = (-2, None, None)
    for pc in range(12):
        for mode, prof in (("maj", MAJ), ("min", MIN)):
            r = np.corrcoef(chroma_mean, np.roll(prof, pc))[0, 1]
            if r > best[0]:
                best = (r, pc, mode)
    _, pc, mode = best
    cam = CAMELOT_MAJ[pc] if mode == "maj" else CAMELOT_MAJ[(pc + 3) % 12]
    return {"key": f"{NOTES[pc]} {mode}", "pc": pc, "mode": mode,
            "camelot": f"{cam}{'B' if mode == 'maj' else 'A'}", "cam_num": cam}


def camelot_score(ka, kb):
    """1.0 = perfect harmonic match, lower = clash."""
    d = min((ka["cam_num"] - kb["cam_num"]) % 12, (kb["cam_num"] - ka["cam_num"]) % 12)
    same_letter = ka["mode"] == kb["mode"]
    if d == 0:
        return 1.0 if same_letter else 0.9
    if d == 1 and same_letter:
        return 0.85
    if d == 2 and same_letter:
        return 0.5
    return max(0.0, 0.4 - 0.1 * d)


def best_key_shift(ka, kb, max_st=2):
    """Semitones to pitch-shift B (|st|<=max_st) to maximise Camelot compatibility with A."""
    best = (camelot_score(ka, kb), 0)
    for st in range(-max_st, max_st + 1):
        if st == 0:
            continue
        pc = (kb["pc"] + st) % 12
        cam = CAMELOT_MAJ[pc] if kb["mode"] == "maj" else CAMELOT_MAJ[(pc + 3) % 12]
        sc = camelot_score(ka, {**kb, "pc": pc, "cam_num": cam}) - 0.05 * abs(st)
        if sc > best[0] + 1e-9:
            best = (sc, st)
    return best[1], best[0]


# ---------------------------------------------------------------- analysis
def analyse(path):
    y, _ = librosa.load(path, sr=SR_AN, mono=True)
    dur = len(y) / SR_AN

    # tempo + beats
    onset_env = librosa.onset.onset_strength(y=y, sr=SR_AN, hop_length=HOP)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=SR_AN, hop_length=HOP, tightness=100)
    tempo = float(np.atleast_1d(tempo)[0])
    beat_t = librosa.frames_to_time(beats, sr=SR_AN, hop_length=HOP)

    # downbeat phase: which beat offset (0..3) has the strongest low-end + onset
    S = np.abs(librosa.stft(y, hop_length=HOP))
    freqs = librosa.fft_frequencies(sr=SR_AN)
    low = S[freqs < 150].sum(axis=0)
    low = low / (low.max() + 1e-9)
    acc = onset_env / (onset_env.max() + 1e-9) + low[: len(onset_env)]
    phase_scores = [acc[beats[k::BEATS_PER_BAR]].mean() for k in range(BEATS_PER_BAR)]
    phase = int(np.argmax(phase_scores))
    bar_beats = beats[phase::BEATS_PER_BAR]           # frame index of each bar start
    bar_t = librosa.frames_to_time(bar_beats, sr=SR_AN, hop_length=HOP)

    # foreground (≈vocals) vs background (≈music) via nearest-neighbour filtering (REPET-SIM)
    S_full, phase_ = librosa.magphase(librosa.stft(y, hop_length=HOP))
    S_filter = librosa.decompose.nn_filter(S_full, aggregate=np.median, metric="cosine",
                                           width=int(librosa.time_to_frames(2, sr=SR_AN, hop_length=HOP)))
    S_filter = np.minimum(S_full, S_filter)
    margin_v = 4
    mask_v = librosa.util.softmask(S_full - S_filter, margin_v * S_filter, power=2)
    S_vox = mask_v * S_full
    band = (freqs > 200) & (freqs < 4000)
    vox = S_vox[band].sum(axis=0)
    rms = librosa.feature.rms(S=S_full)[0]

    chroma = librosa.feature.chroma_cqt(y=y, sr=SR_AN, hop_length=HOP)
    mfcc = librosa.feature.mfcc(y=y, sr=SR_AN, hop_length=HOP, n_mfcc=13)

    # aggregate per bar
    edges = list(bar_beats) + [S_full.shape[1]]
    per_bar = []
    for i in range(len(bar_beats)):
        a, b = edges[i], max(edges[i + 1], edges[i] + 1)
        per_bar.append({
            "t": float(bar_t[i]),
            "rms": float(rms[a:b].mean()),
            "vox": float(vox[a:b].mean()),
            "chroma": chroma[:, a:b].mean(axis=1),
            "mfcc": mfcc[:, a:b].mean(axis=1),
        })
    rms_b = np.array([p["rms"] for p in per_bar]); rms_b /= rms_b.max() + 1e-9
    vox_b = np.array([p["vox"] for p in per_bar])
    vox_b = vox_b / (np.percentile(vox_b, 95) + 1e-9)
    vox_b = np.clip(vox_b, 0, 1.5)
    for p, r, v in zip(per_bar, rms_b, vox_b):
        p["rms_n"], p["vox_n"] = float(r), float(v)

    # section boundaries (structural novelty) on bar-level features
    feats = np.vstack([np.array([p["chroma"] for p in per_bar]).T,
                       librosa.util.normalize(np.array([p["mfcc"] for p in per_bar]).T, axis=1)])
    k = max(4, min(12, len(per_bar) // 12))
    seg_bars = librosa.segment.agglomerative(feats, k)
    section_starts = sorted(set(int(s) for s in seg_bars))

    key = detect_key(chroma.mean(axis=1))
    return dict(path=path, dur=dur, tempo=tempo, beat_t=beat_t, bar_t=bar_t, bars=per_bar,
                key=key, sections=section_starts, downbeat_phase=phase)


# ---------------------------------------------------------------- transition search
def tempo_ratio(ta, tb):
    """Ratio to stretch B so it locks to A, allowing half/double-time interpretation."""
    best = None
    for mult in (0.5, 2 / 3, 0.75, 1.0, 4 / 3, 1.5, 2.0):
        r = ta / (tb * mult)
        if best is None or abs(np.log(r)) < abs(np.log(best[0])):
            best = (r, mult)
    return best  # (stretch_rate for B, B tempo multiplier)


def cos(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9))


def smooth(x, a, b):
    """smoothstep from 0 at a to 1 at b (works on arrays)."""
    t = np.clip((np.asarray(x, dtype=float) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def blend_curves(n):
    """Long DJ blend: B rises under A, bass swaps at the middle, then A fades out."""
    t = np.linspace(0, 1, n)
    gB = 0.85 * smooth(t, 0.0, 0.5) + 0.15 * smooth(t, 0.5, 0.8)
    gA = 1 - smooth(t, 0.45, 1.0)
    return gA, gB


def last_loud_bar(S, thresh=0.55):
    """Index of the last bar that is still 'loud' (end of the last chorus), before the fade/outro."""
    r = np.convolve([b["rms_n"] for b in S["bars"]], np.ones(4) / 4, mode="same")
    loud = np.where(r > thresh * r.max())[0]
    return int(loud[-1]) if len(loud) else len(r) - 1


def find_transition(A, B, mix_bars_options=(8, 16, 24)):
    nA, nB = len(A["bars"]), len(B["bars"])
    secA, secB = set(A["sections"]), set(B["sections"])
    endA = last_loud_bar(A)
    cands = []
    for L in mix_bars_options:
        wA, wB = blend_curves(L)
        overlap_w = wA * wB                      # where both are audible
        for i in range(int(nA * 0.5), nA - L):
            ovA = A["bars"][i:i + L]
            vA = np.array([b["vox_n"] for b in ovA])
            eA_ov = np.array([b["rms_n"] for b in ovA])
            # exit timing: overlap should end around the end of the last loud section, never deep in the fade
            ov_end = i + L
            fade_pen = max(0, ov_end - endA - 2) / 4          # bars spent in A's fade
            early_pen = max(0, endA - ov_end) / nA * 4        # leaving long before the last chorus ends
            for j in range(0, int(nB * 0.60)):
                if j + L + 4 >= nB:
                    break
                ovB = B["bars"][j:j + L]
                vB = np.array([b["vox_n"] for b in ovB])
                clash = float(np.sum(np.minimum(vA, vB) * overlap_w) / (overlap_w.sum() + 1e-9))
                # A still singing when B takes over / B singing while A is still loud
                handoff = float(np.mean(vA * wB * (wA > 0.5)) + np.mean(vB * wA * (wB < 0.5)))
                harm = cos(np.mean([b["chroma"] for b in ovA], axis=0), np.mean([b["chroma"] for b in ovB], axis=0))
                eA = np.mean([b["rms_n"] for b in A["bars"][max(0, i - 4):i]])
                eB = np.mean([b["rms_n"] for b in B["bars"][j + L:j + L + 4]])
                energy = 1 - min(1, abs(eA - eB) * 2)
                timbre = cos(np.mean([b["mfcc"] for b in ovA], axis=0), np.mean([b["mfcc"] for b in ovB], axis=0))
                struct = (0.5 if (i in secA or (i - A["sections"][0]) % PHRASE_BARS == 0) else 0)                        + (0.5 if (j in secB or j % PHRASE_BARS == 0) else 0)
                # B should land on a real section start at the END of the blend (that's where it 'arrives')
                arrive = 0.5 if any(abs((j + L) - s_) <= 1 for s_ in secB) else 0
                skipB = j / nB
                score = (
                    -3.0 * clash
                    - 1.5 * handoff
                    + 1.0 * harm
                    + 1.0 * energy
                    + 0.5 * timbre
                    + 1.0 * struct
                    + arrive
                    + 0.6 * float(eA_ov[: L // 2].mean())     # A still has body when the blend starts
                    - 2.0 * fade_pen
                    - 1.0 * early_pen
                    - 0.5 * skipB
                    + 0.03 * L
                )
                cands.append(dict(score=score, i=i, j=j, L=L, clash=clash, handoff=handoff, harm=harm,
                                  energy=energy, timbre=timbre, struct=struct, arrive=arrive, skipB=skipB,
                                  endA=endA))
    cands.sort(key=lambda c: -c["score"])
    return cands


# ---------------------------------------------------------------- rendering
def sos(kind, fc, sr=SR_OUT):
    return butter(4, fc, btype=kind, fs=sr, output="sos")


def bass_swap_crossfade(a, b, sr=SR_OUT):
    """a, b: (n, 2) equal-length overlap. B rises under A (highs only), bass swaps mid-way, A fades out."""
    n = len(a)
    gA, gB = blend_curves(n)
    gA, gB = gA[:, None], gB[:, None]
    t = np.linspace(0, 1, n)[:, None]
    hp = sos("highpass", 180)
    a_hi = sosfiltfilt(hp, a, axis=0); a_lo = a - a_hi
    b_hi = sosfiltfilt(hp, b, axis=0); b_lo = b - b_hi
    swap = smooth(t, 0.47, 0.57)            # ~1 bar bass swap in a 16-bar blend
    return a_hi * gA + a_lo * gA * (1 - swap) + b_hi * gB + b_lo * swap * np.maximum(gB, 0.7)


def stretch_stereo(x, rate):
    if abs(rate - 1) < 0.005:
        return x
    return np.stack([librosa.effects.time_stretch(x[:, c], rate=rate) for c in range(x.shape[1])], axis=1)


def render(A, B, c, rate, out_prefix, semitones=0, pre_s=40, post_s=40):
    ya, _ = librosa.load(A["path"], sr=SR_OUT, mono=False); ya = ya.T
    yb, _ = librosa.load(B["path"], sr=SR_OUT, mono=False); yb = yb.T
    i, j, L = c["i"], c["j"], c["L"]

    a_start = A["bar_t"][i]
    a_end = A["bar_t"][i + L] if i + L < len(A["bar_t"]) else A["dur"]
    ov_len = int((a_end - a_start) * SR_OUT)

    b_start = B["bar_t"][j]
    # B audio needed: overlap (stretched to A tempo) + the rest of B
    b_seg = yb[int(b_start * SR_OUT):]
    if semitones:
        b_seg = np.stack([librosa.effects.pitch_shift(b_seg[:, ch], sr=SR_OUT, n_steps=semitones)
                          for ch in range(b_seg.shape[1])], axis=1)
    # stretch only the overlap + 8 bars after, then ease back to natural tempo by
    # stretching in a few steps (avoids an audible tempo jump)
    bar_len_b = 60 / B["tempo"] * BEATS_PER_BAR
    n_ov_src = int(round(ov_len * rate))
    ramp_bars = 8
    n_ramp_src = int(bar_len_b * ramp_bars * SR_OUT)
    ov_b = stretch_stereo(b_seg[:n_ov_src], rate)
    ov_b = librosa.util.fix_length(ov_b.T, size=ov_len).T
    pieces = [ov_b]
    steps = 4
    step_len = n_ramp_src // steps
    pos = n_ov_src
    for s in range(steps):
        r = rate + (1 - rate) * (s + 1) / (steps + 1)
        pieces.append(stretch_stereo(b_seg[pos:pos + step_len], r)); pos += step_len
    pieces.append(b_seg[pos:])

    a_pre = ya[: int(a_start * SR_OUT)]
    a_ov = ya[int(a_start * SR_OUT): int(a_start * SR_OUT) + ov_len]
    if len(a_ov) < ov_len:
        a_ov = np.pad(a_ov, ((0, ov_len - len(a_ov)), (0, 0)))
    mixed_ov = bass_swap_crossfade(a_ov, pieces[0])
    b_after = np.concatenate(pieces[1:], axis=0)

    full = np.concatenate([a_pre, mixed_ov, b_after], axis=0)
    peak = np.abs(full).max()
    if peak > 0.99:
        full = full / peak * 0.99

    mix_at = len(a_pre) / SR_OUT
    ex0 = max(0, int((mix_at - pre_s) * SR_OUT))
    ex1 = min(len(full), int((mix_at + ov_len / SR_OUT + post_s) * SR_OUT))
    excerpt = full[ex0:ex1]

    for name, data in (("full", full), ("excerpt", excerpt)):
        wav = f"{out_prefix}_{name}.wav"
        sf.write(wav, data, SR_OUT)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "192k", wav[:-4] + ".mp3"], check=True)
        os.remove(wav)
    return mix_at, ov_len / SR_OUT, ex0 / SR_OUT


def mmss(t):
    t = round(float(t), 1)
    return f"{int(t // 60)}:{t % 60:04.1f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a"); ap.add_argument("b"); ap.add_argument("--out", default="out")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    print("analysing A…"); A = analyse(args.a)
    print("analysing B…"); B = analyse(args.b)
    rate, mult = tempo_ratio(A["tempo"], B["tempo"])
    key_score = camelot_score(A["key"], B["key"])
    shift, shifted_score = best_key_shift(A["key"], B["key"])

    for name, S in (("A", A), ("B", B)):
        print(f"{name}: {os.path.basename(S['path'])}  {mmss(S['dur'])}  tempo {S['tempo']:.1f} BPM  "
              f"key {S['key']['key']} ({S['key']['camelot']})  bars {len(S['bars'])}  "
              f"sections at {[mmss(S['bar_t'][k]) for k in S['sections']]}")
    print(f"tempo match: stretch B by x{rate:.3f} (B's detected tempo counted at {mult:.3g}x"
          f"{' — triplet/half-time relationship' if mult != 1 else ''})")
    print(f"key compatibility {key_score:.2f}" + (f" → {shifted_score:.2f} if B is pitch-shifted {shift:+d} semitone(s)" if shift else ""))

    cands = find_transition(A, B)
    # keep top 5 distinct
    top, seen = [], set()
    for c in cands:
        k = (c["i"] // 2, c["j"] // 2)
        if k in seen:
            continue
        seen.add(k); top.append(c)
        if len(top) == 5:
            break
    print("\nTop transitions (A exit → B entry):")
    for n, c in enumerate(top):
        print(f" #{n + 1} score {c['score']:.2f} | A @ {mmss(A['bar_t'][c['i']])} → B @ {mmss(B['bar_t'][c['j']])} "
              f"| overlap {c['L']} bars | vocal clash {c['clash']:.2f} harm {c['harm']:.2f} "
              f"energy {c['energy']:.2f} struct {c['struct']:.1f} arrive {c['arrive']:.1f}")

    best = top[0]
    abs_rate = rate if abs(np.log(rate)) < np.log(1.12) else 1.0  # don't stretch more than ±12%
    if abs_rate == 1.0 and rate != 1.0:
        print(f"tempo gap too large ({rate:.2f}) — mixing without beat-match (short blend)")
    prefix = os.path.join(args.out, "mix")
    mix_at, ov, ex0 = render(A, B, best, abs_rate, prefix)
    if shift:
        print(f"rendering key-matched version (B {shift:+d} st)…")
        render(A, B, best, abs_rate, prefix + f"_key{shift:+d}", semitones=shift)
    report = {
        "A": {"file": A["path"], "tempo": A["tempo"], "key": A["key"]["key"], "camelot": A["key"]["camelot"]},
        "B": {"file": B["path"], "tempo": B["tempo"], "key": B["key"]["key"], "camelot": B["key"]["camelot"]},
        "stretch_B": abs_rate, "key_compat": key_score, "key_shift_B": shift, "key_compat_shifted": shifted_score,
        "transition": {"A_exit_at": float(A["bar_t"][best["i"]]), "B_entry_at": float(B["bar_t"][best["j"]]),
                       "overlap_bars": best["L"], "overlap_sec": ov, "mix_starts_in_full_mix_at": mix_at,
                       "mix_starts_in_excerpt_at": mix_at - ex0},
        "top5": [{k: (float(v) if isinstance(v, (np.floating, float)) else v) for k, v in c.items()} for c in top],
    }
    with open(os.path.join(args.out, "report.json"), "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n✓ wrote {prefix}_excerpt.mp3 (transition starts at {mmss(mix_at - ex0)}), {prefix}_full.mp3, report.json")


if __name__ == "__main__":
    main()
