"""
yt-dj POC v4 — vocal-phrase handoff.

Builds on v3 (3-band EQ blend, Demucs vocal activity, untouched audio outside the blend) and adds
the DJ rule that vocals only ever START at the beginning of a line and STOP at the end of one:

  * Find vocal phrase ENDS in A (singer finishes a line, then a gap) and phrase STARTS in B.
  * Every candidate transition is anchored on one HANDOFF moment h: A's last word ends, B's first
    word begins. B's instrumental lead-in plays under A before h; A's instrumental tail fades after h.
  * B's mids (its voice) open just BEFORE h, so B's line is heard from its first word — never faded
    in mid-sentence. A's vocal stem is pulled just AFTER h (A has stopped singing anyway).

Usage:  python dj_mix_v4.py audio/A.wav audio/B.wav [--out out_v4] [--pick N]
"""
import argparse, json, os
import numpy as np
import librosa
import soundfile as sf
import subprocess

from dj_mix import analyse, camelot_score, tempo_ratio, cos, smooth, last_loud_bar, mmss, PHRASE_BARS
from dj_mix_v3 import stems, vocal_per_bar, bands, fine_align, soft_limit, SR

ON, OFF = 0.45, 0.2   # vocal activity thresholds (per bar)


# ---------------------------------------------------------------- vocal phrases (20 ms resolution)
HOP_S = 0.02


def vocal_activity(voc, thresh_db=-24, merge_gap=0.35, min_len=0.5):
    """Boolean singer-active track at 20 ms hop from the Demucs vocal stem."""
    mono = voc.mean(axis=1)
    hop = int(HOP_S * SR)
    r = librosa.feature.rms(y=mono, frame_length=hop * 4, hop_length=hop)[0]
    db = 20 * np.log10(r / (np.percentile(r, 95) + 1e-9) + 1e-9)
    db = np.convolve(db, np.ones(10) / 10, mode="same")       # 200 ms smoothing
    act = db > thresh_db
    segs, k = [], 0
    while k < len(act):
        if act[k]:
            e = k
            while e < len(act) and act[e]:
                e += 1
            segs.append([k * HOP_S, e * HOP_S]); k = e
        else:
            k += 1
    merged = []
    for sg in segs:
        if merged and sg[0] - merged[-1][1] < merge_gap:
            merged[-1][1] = sg[1]
        else:
            merged.append(sg)
    merged = [sg for sg in merged if sg[1] - sg[0] >= min_len]
    clean = np.zeros_like(act)
    for s0, s1 in merged:
        clean[int(s0 / HOP_S):int(s1 / HOP_S)] = True
    return clean, merged, db


def vocal_level(db, t0, t1):
    """0..1 loudness of the singer in [t0, t1]: -18 dB → 0, 0 dB (song's loud vocal) → 1."""
    a, b = max(0, int(t0 / HOP_S)), max(0, int(t1 / HOP_S))
    if b <= a:
        return 0.0
    return float(np.clip((np.percentile(db[a:b], 75) + 18) / 18, 0, 1))


def frac_active(act, t0, t1):
    a, b = max(0, int(t0 / HOP_S)), max(0, int(t1 / HOP_S))
    return float(act[a:b].mean()) if b > a else 0.0


def phrase_ends(segs, min_gap=1.0, dur=None):
    """Times where a vocal line ends and the singer stays silent >= min_gap s. Returns (time, gap)."""
    out = []
    for k, (s0, s1) in enumerate(segs):
        nxt = segs[k + 1][0] if k + 1 < len(segs) else (dur or s1 + 99)
        if nxt - s1 >= min_gap:
            out.append((s1, nxt - s1))
    return out


def phrase_starts(segs, min_gap=1.0):
    out = []
    for k, (s0, s1) in enumerate(segs):
        prv = segs[k - 1][1] if k else 0.0
        if s0 - prv >= min_gap:
            out.append((s0, s0 - prv))
    return out


def bar_index(bar_t, t):
    return int(np.searchsorted(bar_t, t - 1e-6))


# ---------------------------------------------------------------- curves anchored on handoff h ∈ (0,1)
def curves(t, h):
    t = np.asarray(t, dtype=float)
    pre = max(h, 1e-3); post = max(1 - h, 1e-3)
    tail = 1 - smooth(t, h + 0.75 * post, 1.0)
    return {
        "B_high": smooth(t, 0.0, h * 0.7),                       # B's air/percussion creeps in under A
        "B_low": smooth(t, h - 0.04 * pre, h + 0.04 * post),     # bass swap AT the handoff
        "B_mid": smooth(t, h - 0.35 * pre, h - 0.02),            # B's voice band fully open just before the first word
        "A_high": (1 - smooth(t, h + 0.2 * post, h + 0.9 * post)) * tail,
        "A_low": (1 - smooth(t, h - 0.04 * pre, h + 0.04 * post)) * tail,
        "A_mid": (1 - smooth(t, h, h + 0.7 * post)) * tail,
        "A_vox": 1 - smooth(t, h, h + 0.05),                     # pull A's vocal stem right after its last word
        "B_mid_pre": 0.35,                                       # B mids level reached before handoff (scaled below)
    }


def mid_gain_B(t, h):
    """B mids: low (35%) during the lead-in so B's chords don't fight A's, full just before the first word."""
    pre = max(h, 1e-3)
    return 0.35 * smooth(t, 0.0, h * 0.6) + 0.65 * smooth(t, h - 0.25 * pre, h - 0.01)


# ---------------------------------------------------------------- search
def peakness(level_vox, rms):
    return 0.5 * level_vox + 0.5 * rms


def find_transition(A, B, actA, segA, dbA, actB, segB, dbB, a_bar):
    """Vocal peak -> vocal peak: A's line ends at one of its high points, B's line starts at one of its
    high points right after (call -> response). No outro, no intro, no music-only gap."""
    nA, nB = len(A["bars"]), len(B["bars"])
    endA = last_loud_bar(A)
    t_endA = float(A["bar_t"][min(endA, nA - 1)])
    beat_A = 60 / A["tempo"]
    rmsA = lambda t0, t1: np.mean([b["rms_n"] for b in A["bars"][bar_index(A["bar_t"], t0):max(bar_index(A["bar_t"], t1), bar_index(A["bar_t"], t0) + 1)]])
    rmsB = lambda t0, t1: np.mean([b["rms_n"] for b in B["bars"][bar_index(B["bar_t"], t0):max(bar_index(B["bar_t"], t1), bar_index(B["bar_t"], t0) + 1)]])
    ends = [(t, g) for t, g in phrase_ends(segA, min_gap=0.25, dur=A["dur"]) if A["dur"] * 0.55 <= t <= t_endA]
    starts = [(t, g) for t, g in phrase_starts(segB, min_gap=0.25) if 8 <= t <= B["dur"] * 0.6]
    beatsA, beatsB = np.asarray(A["beat_t"]), np.asarray(B["beat_t"])
    A_info = []
    for tA, gA in ends:
        A_info.append((tA, gA, vocal_level(dbA, tA - 6, tA), rmsA(tA - 6, tA)))
    cands = []
    for tA, gA, a_vox, a_rms in A_info:
        a_pk = peakness(a_vox, a_rms)
        for tB, gB in starts:
            b_vox, b_rms = vocal_level(dbB, tB, tB + 6), rmsB(tB, tB + 6)
            b_pk = peakness(b_vox, b_rms)
            k = np.searchsorted(beatsB, tB + 0.05) - 1
            tH_B = float(beatsB[max(k, 0)])
            for d_beats in (0.5, 1, 2):                    # breath between A's last word and B's first word
                tH = tA + d_beats * beat_A
                for pre_bars in (1, 2):                     # B's music (vocal muted) under A's last bar(s)
                    for post_bars in (2, 3, 4):             # A's music fading under B's vocal
                        t0 = tA - pre_bars * a_bar
                        t1 = tH + post_bars * a_bar
                        lead = tH - t0
                        if t0 < 0 or t1 >= A["dur"] - 0.5 or tH_B - lead < 0 or tH_B + (t1 - tH) + 10 >= B["dur"]:
                            continue
                        i0 = max(0, bar_index(A["bar_t"], t0) - 1); i1 = min(nA - 1, bar_index(A["bar_t"], t1))
                        if i1 <= i0:
                            continue
                        j0 = bar_index(B["bar_t"], tH_B - lead)
                        a_next = frac_active(actA, tA + 0.3, t1)       # A's singer would start again (we pull it)
                        level = 1 - min(1, abs(a_rms - b_rms) * 2)
                        vox_match = 1 - min(1, abs(a_vox - b_vox) * 1.5)
                        sA = bar_index(A["bar_t"], tA); sB = bar_index(B["bar_t"], tH_B)
                        harm = cos(np.mean([b["chroma"] for b in A["bars"][max(0, sA - 2):sA + 1]], axis=0),
                                   np.mean([b["chroma"] for b in B["bars"][sB:sB + 3]], axis=0))
                        late = sA / nA                                  # prefer the LAST big chorus of A
                        score = (2.0 * a_pk + 2.0 * b_pk + 1.5 * level + 1.0 * vox_match + 0.8 * harm
                                 + 1.0 * late - 2.5 * (tH_B / B["dur"]) - 0.5 * a_next
                                 + 0.2 * min(gA, 1.5) + 0.1 * post_bars - 0.1 * abs(d_beats - 1))
                        cands.append(dict(score=score, tA=float(tA), tH=float(tH), tH_B=tH_B, d=d_beats, i0=i0, i1=i1,
                                          j0=j0, pre_bars=pre_bars, post_bars=post_bars, a_vox=a_vox, a_rms=a_rms,
                                          b_vox=b_vox, b_rms=b_rms, level=level, vox_match=vox_match, harm=harm,
                                          a_next=a_next, endA=endA))
    cands.sort(key=lambda c: -c["score"])
    return cands


# ---------------------------------------------------------------- render
def render(A, B, c, voc_a, voc_b, out_prefix, pre_x=40, post_x=40):
    ya, _ = librosa.load(A["path"], sr=SR, mono=False); ya = ya.T
    yb, _ = librosa.load(B["path"], sr=SR, mono=False); yb = yb.T
    a0, a1 = int(A["bar_t"][c["i0"]] * SR), int(A["bar_t"][c["i1"]] * SR)
    n = a1 - a0
    hA = int(c["tH"] * SR)
    # place B so its first word lands exactly on A's handoff, then refine on transients
    b0 = int(c["tH_B"] * SR) - (hA - a0)
    b0, shift_ms = fine_align(ya, yb, a0, b0)
    h = (hA - a0) / n

    seg_a, seg_b, seg_va = ya[a0:a1], yb[b0:b0 + n], voc_a[a0:a1]
    seg_vb = voc_b[b0:b0 + n]
    if len(seg_vb) < n:
        seg_vb = np.pad(seg_vb, ((0, n - len(seg_vb)), (0, 0)))
    rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-9
    gain_target = float(np.clip(rms(yb[b0 + n:b0 + n + 8 * SR]) / rms(ya[max(0, a0 - 8 * SR):a0]), 0.75, 1.33))
    t = np.linspace(0, 1, n)
    cv = curves(t, h)
    cv["B_mid"] = mid_gain_B(t, h)
    hv = (c["tA"] * SR - a0) / n
    cv["A_vox"] = 1 - smooth(t, hv + 0.01, hv + 0.06)
    g_level = (1 + (gain_target - 1) * smooth(t, 0, h))[:, None]

    a_lo, a_mid, a_hi = bands(seg_a)
    v_lo, v_mid, v_hi = bands(seg_va)
    b_lo, b_mid, b_hi = bands(seg_b)
    col = lambda k: cv[k][:, None]
    pull = 1 - col("A_vox")
    A_out = (col("A_low") * (a_lo - pull * v_lo) + col("A_mid") * (a_mid - pull * v_mid)
             + col("A_high") * (a_hi - pull * v_hi)) * g_level
    # B's vocal muted during its lead-in (instrumental only), cut in exactly at its line start.
    # At t>=h the pull is 0, so B is the untouched original from there on.
    wb_lo, wb_mid, wb_hi = bands(seg_vb)
    pull_b = (1 - smooth(t, h - 0.012, h))[:, None]
    B_out = (col("B_low") * (b_lo - pull_b * wb_lo) + col("B_mid") * (b_mid - pull_b * wb_mid)
             + col("B_high") * (b_hi - pull_b * wb_hi))
    blend = soft_limit(A_out + B_out)
    full = np.concatenate([ya[:a0], blend, yb[b0 + n:]], axis=0)

    assert np.array_equal(full[:a0], ya[:a0]), "A before blend modified!"
    assert np.array_equal(full[a0 + n:], yb[b0 + n:]), "B after blend modified!"

    sf.write(out_prefix + "_full.wav", full, SR, subtype="FLOAT")
    ex0 = max(0, a0 - pre_x * SR); ex1 = min(len(full), a0 + n + post_x * SR)
    sf.write(out_prefix + "_excerpt.wav", full[ex0:ex1], SR)
    for nm in ("_full", "_excerpt"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out_prefix + nm + ".wav",
                        "-b:a", "320k", out_prefix + nm + ".mp3"], check=True)
    os.remove(out_prefix + "_excerpt.wav")
    return dict(blend_start=a0 / SR, blend_len=n / SR, handoff_in_excerpt=(hA - ex0) / SR,
                blend_in_excerpt=(a0 - ex0) / SR, b_entry=b0 / SR, fine_shift_ms=shift_ms, level_gain_A=gain_target)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a"); ap.add_argument("b")
    ap.add_argument("--out", default="out_v6"); ap.add_argument("--pick", type=int, default=1)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    A, B = analyse(args.a), analyse(args.b)
    voc_a, voc_b = stems(args.a), stems(args.b)
    actA, segA, dbA = vocal_activity(voc_a, merge_gap=0.2); actB, segB, dbB = vocal_activity(voc_b, merge_gap=0.2)
    a_bar, b_bar = np.diff(A["bar_t"]).mean(), np.diff(B["bar_t"]).mean()
    rate, _ = tempo_ratio(A["tempo"], B["tempo"])
    print(f"A {A['tempo']:.1f} BPM {A['key']['key']} | B {B['tempo']:.1f} BPM {B['key']['key']} | tempo ratio {rate:.3f}")
    print("A line ends (2nd half):" if False else "A line ends (2nd half):", [f"{mmss(t)} (gap {g:.1f}s)" for t, g in phrase_ends(segA, dur=A["dur"]) if t >= A["dur"] * 0.5])
    print("B line starts (1st 60%):", [f"{mmss(t)} (gap {g:.1f}s)" for t, g in phrase_starts(segB, min_gap=0.4) if t <= B["dur"] * 0.75])

    cands = find_transition(A, B, actA, segA, dbA, actB, segB, dbB, a_bar)
    top, seen = [], set()
    for c in cands:
        k = (round(c["tA"], 1), round(c["tH_B"], 1))
        if k in seen:
            continue
        seen.add(k); top.append(c)
        if len(top) == 5:
            break
    for n_, c in enumerate(top):
        print(f" #{n_ + 1} {c['score']:.2f} | A line ends {mmss(c['tA'])} (vox {c['a_vox']:.2f} loud {c['a_rms']:.2f}) "
              f"→ +{c['d']} beat → B line {mmss(c['tH_B'])} (vox {c['b_vox']:.2f} loud {c['b_rms']:.2f}) "
              f"| level {c['level']:.2f} harm {c['harm']:.2f} | blend {c['pre_bars']}+{c['post_bars']} bars")
    best = top[args.pick - 1]
    info = render(A, B, best, voc_a, voc_b, os.path.join(args.out, "mix"))
    print(f"\nrendered #{args.pick}: blend from A {mmss(info['blend_start'])} for {info['blend_len']:.1f}s, "
          f"B starts at {mmss(info['b_entry'])} (fine {info['fine_shift_ms']:+.0f} ms), A level x{info['level_gain_A']:.2f}")
    print(f"✓ originals untouched outside the blend (asserted)")
    print(f"✓ {args.out}/mix_excerpt.mp3 — blend starts {mmss(info['blend_in_excerpt'])}, B's vocal enters at {mmss(info['handoff_in_excerpt'])}")
    json.dump({"best": {k: float(v) if isinstance(v, (float, np.floating)) else v for k, v in best.items()},
               "render": info}, open(os.path.join(args.out, "report.json"), "w"), indent=2)


if __name__ == "__main__":
    main()
