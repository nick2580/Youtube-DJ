import numpy as np, librosa
from dj_mix import analyse, mmss
from dj_mix_v3 import stems, vocal_per_bar, find_transition, curves
A, B = analyse("audio/FxAG_11PzCk.wav"), analyse("audio/GVizJ_jpUnw.wav")
vA = vocal_per_bar(stems(A["path"]), A["bar_t"], A["dur"]); vB = vocal_per_bar(stems(B["path"]), B["bar_t"], B["dur"])
bi = lambda S, t: int(np.argmin(abs(S["bar_t"] - t)))
print("A bar len %.2fs, B bar len %.2fs" % (np.diff(A["bar_t"]).mean(), np.diff(B["bar_t"]).mean()))
for name, ta, tb, L in (("v2", 233.2, 20.9, 24), ("v3#1", 261.5, 20.9, 16)):
    i, j = bi(A, ta), bi(B, tb)
    print(f"\n{name}: A from {mmss(A['bar_t'][i])}, B from {mmss(B['bar_t'][j])}, {L} bars")
    print(" bar  A-time  Avox  B-time  Bvox")
    for n in range(-2, L + 4):
        a = f"{mmss(A['bar_t'][i+n])} {vA[i+n]:.2f}" if 0 <= i+n < len(vA) else "   -    -  "
        b = f"{mmss(B['bar_t'][j+n])} {vB[j+n]:.2f}" if 0 <= j+n < len(vB) and n >= 0 else ""
        print(f" {n:3d}  {a}   {b}")
cands = find_transition(A, B, vA, vB)
i, j = bi(A, 233.2), bi(B, 20.9)
m = [c for c in cands if c["i"] == i and c["j"] == j and c["L"] == 24]
rank = next(k for k, c in enumerate(cands) if c is m[0])
print("\nv2 placement under v3 scoring: rank", rank + 1, {k: round(v, 2) if isinstance(v, float) else v for k, v in m[0].items()})
print("v3 #1:", {k: round(v, 2) if isinstance(v, float) else v for k, v in cands[0].items()})
