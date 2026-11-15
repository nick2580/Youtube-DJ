"""
yt-dj POC v7 — mix like the reference DJ (Boh!B set analysis).

What the reference DJ does, and how v7 copies it:
  1. Hook -> hook: ~1 min per song; leave A at the end of a strong vocal line, enter B at the start of one.
  2. Session tempo: B is tempo-matched to A (Rubber Band, pitch preserved, max ±4%) for the rest of the song.
  3. Technique by key:
       compatible keys -> 'blend'     : 8-bar 3-band EQ blend, B's vocal muted until its line starts
       clashing keys   -> 'bass_drop' : 4-bar lead-in, B thin (no bass, no vocal) under A's last line,
                                         both basses out for the last 2 bars, then on the downbeat B's
                                         bass + vocal slam in and A cuts out with an echo tail
  4. Switch on A's beat grid (downbeat preferred); B's first word lands on that beat.
  5. Outside the blend: A untouched; B = original (or tempo-matched original), verified.

Usage: python dj_mix_v7.py audio/A.wav audio/B.wav [--out out_v7] [--pick N] [--style auto|blend|bass_drop]
"""
import argparse, json, os, subprocess, tempfile
import numpy as np
import librosa
import soundfile as sf

from dj_mix import analyse, camelot_score, tempo_ratio, cos, smooth, last_loud_bar, mmss
from dj_mix_v3 import stems, bands, fine_align, soft_limit, SR
from dj_mix_v5 import vocal_activity, vocal_level, frac_active, phrase_ends, phrase_starts, bar_index

MAX_STRETCH = 0.04


# ---------------------------------------------------------------- tempo match (Rubber Band via ffmpeg)
def tempo_match(path, k):
    """Return B's audio sped up by factor k (k>1 faster), pitch preserved."""
    y, _ = librosa.load(path, sr=SR, mono=False)
    if abs(k - 1) < 0.003:
        return y.T, 1.0
    out = os.path.join(tempfile.gettempdir(), f"ytdj_stretch_{os.getpid()}.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-af",
                    f"rubberband=tempo={k:.5f}:pitch=1:transients=crisp:detector=compound:phase=laminar:"
                    f"window=standard:smoothing=off:formant=preserved:pitchq=quality:channels=together",
                    "-ar", str(SR), out], check=True)
    z, _ = librosa.load(out, sr=SR, mono=False); os.remove(out)
    return z.T, k


# ---------------------------------------------------------------- song structure (allin1 sections)
def _seg_at(segs, t):
    for x in segs:
        if x["start"] <= t < x["end"]:
            return x
    return None


def section_score_exit(segs, tA):
    """DJ rule: leave A at the END of a chorus (its last big hook), never inside intro/outro."""
    x = _seg_at(segs, tA - 0.2)
    if not x:
        return None, 0.0
    lab, to_end = x["label"], x["end"] - tA
    if lab == "chorus":
        return ("end of chorus" if to_end < 6 else "chorus"), (1.4 if to_end < 6 else 0.6)
    if lab in ("verse", "bridge") and to_end < 4:
        return f"end of {lab}", 0.3
    if lab in ("intro", "outro", "start", "end"):
        return lab, -1.5
    return lab, 0.0


def section_score_entry(segs, tB):
    """DJ rule: land B on the START of a chorus (hook), else a verse start; never its intro/outro."""
    x = _seg_at(segs, tB + 0.2)
    if not x:
        return None, 0.0
    lab, from_start = x["label"], tB - x["start"]
    if lab == "chorus":
        return ("chorus start" if from_start < 4 else "chorus"), (1.4 if from_start < 4 else 0.5)
    if lab == "verse":
        return ("verse start" if from_start < 4 else "verse"), (0.4 if from_start < 4 else 0.0)
    if lab in ("intro", "start"):
        return lab, -1.0
    if lab in ("outro", "end"):
        return lab, -2.0
    return lab, 0.0


# ---------------------------------------------------------------- search
def find_transition(A, B, actA, segA, dbA, actB, segB, dbB, k):
    nA = len(A["bars"])
    endA = last_loud_bar(A)
    t_endA = float(A["bar_t"][min(endA, nA - 1)])
    segsA, segsB = A.get("segments") or [], B.get("segments") or []
    outro = [x for x in segsA if x["label"] in ("outro", "end") and x["start"] >= 0.5 * A["dur"]]
    if outro:                                   # allin1: never leave from inside the outro
        t_endA = outro[0]["start"] + 0.5
    beat = 60 / A["tempo"]; a_bar = 4 * beat
    beatsA, beatsB = np.asarray(A["beat_t"]), np.asarray(B["beat_t"])
    bar_set = set(np.round(A["bar_t"], 2))
    rms_at = lambda S, t0, t1: np.mean([b["rms_n"] for b in S["bars"][bar_index(S["bar_t"], t0):max(bar_index(S["bar_t"], t1), bar_index(S["bar_t"], t0) + 1)]])
    ends = [(t, g) for t, g in phrase_ends(segA, min_gap=0.18, dur=A["dur"]) if A["dur"] * 0.4 <= t <= t_endA]
    starts = [(t, g) for t, g in phrase_starts(segB, min_gap=0.18) if 8 <= t <= B["dur"] * 0.6]
    cands = []
    for tA, gA in ends:
        a_vox, a_rms = vocal_level(dbA, tA - 6, tA), rms_at(A, tA - 6, tA)
        a_sec, struct_a = section_score_exit(segsA, tA)
        # B's first word lands on the first A beat >= 1/4 beat after A's last word, within 2 beats
        nb = np.searchsorted(beatsA, tA + 0.25 * beat)
        for m in range(nb, min(nb + 3, len(beatsA))):
            tH = float(beatsA[m])
            if tH - tA > 2 * beat:
                break
            on_down = any(abs(tH - bt) < 0.05 for bt in A["bar_t"])
            for tB, gB in starts:
                b_vox, b_rms = vocal_level(dbB, tB, tB + 6), rms_at(B, tB, tB + 6)
                kk = np.searchsorted(beatsB, tB + 0.05) - 1
                tH_B = float(beatsB[max(kk, 0)])
                b_sec, struct_b = section_score_entry(segsB, tB)
                level = 1 - min(1, abs(a_rms - b_rms) * 2)
                vox_match = 1 - min(1, abs(a_vox - b_vox) * 1.5)
                sA, sB = bar_index(A["bar_t"], tA), bar_index(B["bar_t"], tH_B)
                harm = cos(np.mean([b["chroma"] for b in A["bars"][max(0, sA - 2):sA + 1]], axis=0),
                           np.mean([b["chroma"] for b in B["bars"][sB:sB + 3]], axis=0))
                lead_s = 8 * a_bar
                if tH - lead_s < 0 or tH_B / k - lead_s < 0 or tH + 4 * a_bar >= A["dur"] or tH_B + 30 >= B["dur"]:
                    continue
                a_next = frac_active(actA, tA + 0.3, tH + 2 * a_bar)
                score = (2.0 * (0.5 * a_vox + 0.5 * a_rms) + 2.0 * (0.5 * b_vox + 0.5 * b_rms)
                         + 1.5 * level + 1.0 * vox_match + 0.8 * harm + 0.5 * (sA / nA)
                         - 2.5 * (tH_B / B["dur"]) - 0.5 * a_next + 0.2 * min(gA, 1.5)
                         + (0.4 if on_down else 0) - 0.15 * (m - nb)
                         + struct_a + struct_b)
                cands.append(dict(score=score, tA=float(tA), tH=tH, tH_B=tH_B, on_down=on_down, a_sec=a_sec, b_sec=b_sec,
                                  a_vox=a_vox, a_rms=a_rms, b_vox=b_vox, b_rms=b_rms, level=level,
                                  vox_match=vox_match, harm=harm, a_next=a_next))
    cands.sort(key=lambda c: -c["score"])
    return cands


# ---------------------------------------------------------------- techniques
def echo_tail(x, beat_n, fb=0.45, taps=6):
    """Dub-style echo: repeats every 1/2 beat, decaying. x is the dry source (already gated)."""
    D = beat_n // 2
    y = np.zeros((len(x) + D * taps, x.shape[1]))
    for t in range(1, taps + 1):
        y[t * D:t * D + len(x)] += (fb ** t) * x
    return y


def render(A, B, c, style, ya, yb, voc_a, voc_b, k, out_prefix, pre_x=30, post_x=30):
    beat = 60 / A["tempo"]; a_bar = 4 * beat
    beat_n = int(beat * SR)
    pre_bars, post_bars = (8, 4) if style == "blend" else (4, 2)
    hA = int(c["tH"] * SR)
    a0, a1 = hA - int(pre_bars * a_bar * SR), hA + int(post_bars * a_bar * SR)
    n = a1 - a0
    # B (tempo-matched timeline): its first word lands on hA
    b0 = int(c["tH_B"] / k * SR) - (hA - a0)
    b0, shift_ms = fine_align(ya, yb, a0, b0, max_ms=40)
    h = (hA - a0) / n
    t = np.linspace(0, 1, n)

    seg_a, seg_b = ya[a0:a1], yb[b0:b0 + n]
    va = voc_a[a0:a1]
    vb = voc_b[b0:b0 + n] if len(voc_b) >= b0 + n else np.pad(voc_b[b0:], ((0, b0 + n - len(voc_b)), (0, 0)))
    a_lo, a_mid, a_hi = bands(seg_a); b_lo, b_mid, b_hi = bands(seg_b)
    va_lo, va_mid, va_hi = bands(va); vb_lo, vb_mid, vb_hi = bands(vb)

    rms = lambda x: np.sqrt(np.mean(x ** 2)) + 1e-9
    g_target = float(np.clip(rms(yb[b0 + n:b0 + n + 8 * SR]) / rms(ya[max(0, a0 - 8 * SR):a0]), 0.75, 1.33))
    g_level = (1 + (g_target - 1) * smooth(t, 0, h))[:, None]

    eps = 1.0 / n
    beat_f = beat / (n / SR)                        # one beat as a fraction of the blend
    pull_b = (1 - smooth(t, h - 0.3 * beat_f, h))[:, None]          # B's vocal muted until its first word
    hv = (c["tA"] * SR - a0) / n
    pull_a = smooth(t, hv + 0.25 * beat_f, hv + 0.75 * beat_f)[:, None]  # A's vocal out after its last word

    if style == "blend":
        cv = {
            "B_high": smooth(t, 0.0, h * 0.7), "B_mid": 0.35 * smooth(t, 0, h * 0.6) + 0.65 * smooth(t, h - 2 * beat_f, h),
            "B_low": smooth(t, h - beat_f, h + beat_f),
            "A_low": 1 - smooth(t, h - beat_f, h + beat_f), "A_mid": 1 - smooth(t, h, 1.0), "A_high": 1 - smooth(t, h + 0.2 * (1 - h), 1.0),
        }
        echo = None
    else:  # bass_drop
        bass_out = h - 2 * 4 * beat_f                  # both basses out for the last 2 bars before the drop
        cv = {
            "B_high": 0.8 * smooth(t, 0.0, h * 0.8) + 0.2 * smooth(t, h - eps, h + eps),
            "B_mid": 0.3 * smooth(t, 0.0, h * 0.8) + 0.7 * smooth(t, h - 0.5 * beat_f, h),
            "B_low": smooth(t, h - 0.02 * beat_f, h + 0.02 * beat_f),          # slam on the downbeat
            "A_low": 1 - smooth(t, bass_out - 0.5 * beat_f, bass_out),
            "A_mid": 1 - smooth(t, h - 0.1 * beat_f, h + 0.25 * beat_f),       # A cuts out on the drop...
            "A_high": 1 - smooth(t, h - 0.1 * beat_f, h + 0.25 * beat_f),
        }
        # ...and its last beat before the drop echoes out (vocal + mids), high-passed, ~2 bars
        g0, g1 = max(0, hA - a0 - beat_n), hA - a0
        src = np.zeros_like(seg_a)
        src[g0:g1] = (a_mid + a_hi)[g0:g1] * np.hanning(2 * (g1 - g0))[g1 - g0:, None][::-1]
        echo = echo_tail(src, beat_n)[:n] * 0.8
        echo[:g1] = 0

    col = lambda key: np.asarray(cv[key])[:, None]
    A_out = (col("A_low") * (a_lo - pull_a * va_lo) + col("A_mid") * (a_mid - pull_a * va_mid)
             + col("A_high") * (a_hi - pull_a * va_hi)) * g_level
    B_out = (col("B_low") * (b_lo - pull_b * vb_lo) + col("B_mid") * (b_mid - pull_b * vb_mid)
             + col("B_high") * (b_hi - pull_b * vb_hi))
    mix = A_out + B_out
    if echo is not None:
        mix = mix + echo * g_level
    blend = soft_limit(mix)
    full = np.concatenate([ya[:a0], blend, yb[b0 + n:]], axis=0)
    assert np.array_equal(full[:a0], ya[:a0]), "A before blend modified!"
    assert np.array_equal(full[a0 + n:], yb[b0 + n:]), "B after blend modified!"

    sf.write(out_prefix + "_full.wav", full, SR, subtype="FLOAT")
    ex0 = max(0, a0 - pre_x * SR); ex1 = min(len(full), a0 + n + post_x * SR)
    sf.write(out_prefix + "_excerpt.wav", full[ex0:ex1], SR)
    for nm in ("_full", "_excerpt"):
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out_prefix + nm + ".wav", "-b:a", "320k",
                        out_prefix + nm + ".mp3"], check=True)
    os.remove(out_prefix + "_excerpt.wav")
    return dict(blend_start=a0 / SR, blend_len=n / SR, drop_in_excerpt=(hA - ex0) / SR,
                blend_in_excerpt=(a0 - ex0) / SR, b_entry_orig=b0 * k / SR, fine_shift_ms=shift_ms, a_gain=g_target)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a"); ap.add_argument("b")
    ap.add_argument("--out", default="out_v7"); ap.add_argument("--pick", type=int, default=1)
    ap.add_argument("--style", default="auto", choices=["auto", "blend", "bass_drop"])
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    A, B = analyse(args.a), analyse(args.b)
    voc_a, voc_b = stems(args.a), stems(args.b)
    actA, segA, dbA = vocal_activity(voc_a, merge_gap=0.2); actB, segB, dbB = vocal_activity(voc_b, merge_gap=0.2)

    rate, mult = tempo_ratio(A["tempo"], B["tempo"])         # B speed factor to lock to A
    k = rate if abs(rate - 1) <= MAX_STRETCH else 1.0
    kc = camelot_score(A["key"], B["key"])
    style = args.style if args.style != "auto" else ("blend" if kc >= 0.85 else "bass_drop")
    print(f"A {A['tempo']:.1f} BPM {A['key']['key']} ({A['key']['camelot']}) | B {B['tempo']:.1f} BPM {B['key']['key']} ({B['key']['camelot']})")
    print(f"tempo lock: B x{k:.3f}{'' if k == rate else f' (needed x{rate:.3f} > ±4%, left natural)'} | key compat {kc:.2f} → technique: {style}")

    yb, k = tempo_match(args.b, k)
    ya, _ = librosa.load(args.a, sr=SR, mono=False); ya = ya.T
    if k != 1.0:   # stems on the stretched timeline (only used inside the blend)
        voc_b = librosa.effects.time_stretch(voc_b.T, rate=k).T

    cands = find_transition(A, B, actA, segA, dbA, actB, segB, dbB, k)
    top, seen = [], set()
    for c in cands:
        key = (round(c["tA"]), round(c["tH_B"]))
        if key in seen:
            continue
        seen.add(key); top.append(c)
        if len(top) == 5:
            break
    for i, c in enumerate(top):
        print(f" #{i + 1} {c['score']:.2f} | A line ends {mmss(c['tA'])} → drop {mmss(c['tH'])}{' (downbeat)' if c['on_down'] else ''} "
              f"→ B line {mmss(c['tH_B'])} | vox A {c['a_vox']:.2f} B {c['b_vox']:.2f} loud A {c['a_rms']:.2f} B {c['b_rms']:.2f} harm {c['harm']:.2f}")
    best = top[args.pick - 1]
    info = render(A, B, best, style, ya, yb, voc_a, voc_b, k, os.path.join(args.out, "mix"))
    print(f"\nrendered #{args.pick} [{style}]: blend {mmss(info['blend_start'])} for {info['blend_len']:.1f}s, "
          f"B from {mmss(info['b_entry_orig'])} (fine {info['fine_shift_ms']:+.0f} ms), A level x{info['a_gain']:.2f}")
    print("✓ A before blend untouched, B after blend = original" + (" (tempo-matched)" if k != 1 else "") + " — asserted")
    print(f"✓ {args.out}/mix_excerpt.mp3 — blend starts {mmss(info['blend_in_excerpt'])}, drop at {mmss(info['drop_in_excerpt'])}")
    json.dump({"style": style, "k": k, "best": best, "render": info}, open(os.path.join(args.out, "report.json"), "w"),
              indent=2, default=float)


if __name__ == "__main__":
    main()
