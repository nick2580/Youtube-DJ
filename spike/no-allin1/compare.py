"""
Does the mix need allin1? For song pairs the helper already mixed, plan each A->B twice with the engine's own
search (v7 + hype): once on allin1 analysis (what the helper uses), once on the librosa-only analysis
(fast_analysis without struct = what a browser port gets for free). Reports how often the choice is the same.

usage (from the repo root): poc/.venv/Scripts/python spike/no-allin1/compare.py [max_pairs]
Reads poc/feedback/feedback.jsonl for the pairs and their ratings; touches no cache files (pickles untouched).
"""
import json, os, sys

POC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "poc")
os.chdir(POC); sys.path.insert(0, POC)
import numpy as np  # noqa: E402
import engine, structure  # noqa: E402
from fast_analysis import analyse_fast  # noqa: E402

_lib = {}


def librosa_only(path):
    if path not in _lib:
        _lib[path] = analyse_fast(path, None)
    return _lib[path]


def grid_agreement(a1, lb, tol=0.07):
    """share of allin1 downbeats with a librosa bar start within tol s, and same for beats"""
    near = lambda ref, est: float(np.mean([np.min(np.abs(est - t)) < tol for t in ref])) if len(ref) and len(est) else np.nan
    return near(np.asarray(a1["bar_t"]), np.asarray(lb["bar_t"])), near(np.asarray(a1["beat_t"]), np.asarray(lb["beat_t"]))


rows = [json.loads(l) for l in open("feedback/feedback.jsonl", encoding="utf-8")]
last = {}
for r in rows:                               # one record per mix: last line wins, keep the rating
    last[r["mix_id"]] = {**last.get(r["mix_id"], {}), **{k: v for k, v in r.items() if v is not None}}
pairs = {}
for m in last.values():
    if m.get("event") and m.get("a") and m.get("b"):
        pairs.setdefault((m["a"], m["b"], round(m.get("a_rate") or 1, 4)), m.get("rating"))
maxn = int(sys.argv[1]) if len(sys.argv) > 1 else 40
out, tracks = [], {}
for (a, b, ar), rating in list(pairs.items())[:maxn]:
    pa, pb = f"cache/{a}.wav", f"cache/{b}.wav"
    if not (os.path.exists(pa + ".a1.pkl") and os.path.exists(pb + ".a1.pkl")):
        continue
    try:
        X1 = engine.pair_candidates(pa, pb, ar)
        orig = engine.analysis
        engine.analysis = librosa_only
        try:
            X2 = engine.pair_candidates(pa, pb, ar)
        finally:
            engine.analysis = orig
    except Exception as e:
        print("skip", a, b, e); continue
    c1, e2 = X1["every"][0], X2["every"]
    if not e2:
        out.append(dict(a=a, b=b, rating=rating, same=False, note="librosa: no candidates")); continue
    c2 = e2[0]
    # where does allin1's pick sit in the librosa ranking (same exit within 1 beat, same entry within 1 beat)?
    beat = 60 / X1["A"]["tempo"]
    rank = next((i for i, c in enumerate(e2) if abs(c["tH"] - c1["tH"]) < beat and abs(c["tH_B"] - c1["tH_B"]) < beat), None)
    same_exit = abs(c1["tH"] - c2["tH"]) < beat; same_entry = abs(c1["tH_B"] - c2["tH_B"]) < beat
    near_exit = abs(c1["tH"] - c2["tH"]) < 4 * 4 * beat; near_entry = abs(c1["tH_B"] - c2["tH_B"]) < 4 * 4 * beat
    out.append(dict(a=a, b=b, rating=rating, same=same_exit and same_entry, same_exit=same_exit, same_entry=same_entry,
                    within_4_bars=near_exit and near_entry, a1_rank_in_librosa=rank, n_librosa=len(e2),
                    a1=(round(c1["tH"], 1), round(c1["tH_B"], 1), c1.get("a_sec"), c1.get("b_sec")),
                    lib=(round(c2["tH"], 1), round(c2["tH_B"], 1)),
                    tempo=(round(X1["B0"]["tempo"], 1), round(X2["B0"]["tempo"], 1)), k=(round(X1["k"], 4), round(X2["k"], 4))))
    for t in (a, b):
        if t not in tracks:
            p = f"cache/{t}.wav"
            tracks[t] = grid_agreement(engine.analysis(p), librosa_only(p)) + (round(engine.analysis(p)["tempo"], 1), round(librosa_only(p)["tempo"], 1))
    print(json.dumps(out[-1]), flush=True)

n = len(out)
f = lambda k: sum(1 for o in out if o.get(k)) / max(n, 1)
print(f"\n{n} pairs: identical pick {f('same'):.0%}, same exit {f('same_exit'):.0%}, same entry {f('same_entry'):.0%}, both within 4 bars {f('within_4_bars'):.0%}")
rk = [o["a1_rank_in_librosa"] for o in out if "a1_rank_in_librosa" in o]
print(f"allin1's pick in librosa's ranking: top-3 {sum(1 for r in rk if r is not None and r < 3)}/{len(rk)}, missing {sum(1 for r in rk if r is None)}/{len(rk)}")
g = np.array([v[:2] for v in tracks.values()], dtype=float)
print(f"{len(tracks)} songs: allin1 downbeats matched by a librosa bar start {np.nanmean(g[:, 0]):.0%}, beats {np.nanmean(g[:, 1]):.0%}")
tm = [v[2:] for v in tracks.values()]
print("tempo off by >2% (allin1 vs librosa):", sum(1 for x, y in tm if abs(x / y - 1) > 0.02), "of", len(tm), [(x, y) for x, y in tm if abs(x / y - 1) > 0.02][:8])
