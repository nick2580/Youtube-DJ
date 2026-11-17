"""
Set planner: choose the next transition by looking several songs ahead in the Mix queue.

Planning one transition at a time is greedy: A->B picks B's entry without asking whether there is a good way
OUT of B later. In the feedback log that gave songs anywhere from 64 s to 295 s in the set, some leaving before
their hook ever played and some playing almost to the end.

Here the next transitions are chosen together (A->B, B->C, C->D), scoring:
  * each transition with the engine's own score (v7 + hype), unchanged;
  * each song in the middle of the chain, from where it enters to where it leaves:
      - time in the set: 90-170 s is free, shorter or longer costs a little per second;
      - its main hook (YouTube "Most replayed") inside that stretch earns a bonus.
Only the first transition is committed and rendered. When the next song actually starts, the helper plans
again from what really happened (receding horizon), so a reordered queue or a skip costs nothing.

All times here are in each song's ORIGINAL timeline (what YouTube's currentTime shows) unless named *_s.
"""
import os

import numpy as np

import hype

PLAY_MIN, PLAY_MAX = 90.0, 170.0      # seconds of a song in the set that need no correction
W_SHORT, W_LONG = 1 / 30, 1 / 60      # per second outside that range
W_HOOK = 1.2                          # main hook fully inside the song's stretch
NO_EXIT = -4.0                        # no transition possible out of a song: it plays out and YouTube cuts
HANDOVER_S = 20.0                     # after B's drop: 4 bars of blend + the handover, before B's next mix may start
TOP_PER_EXIT, TOP_TOTAL = 4, 400      # candidates kept per stage (best few per exit point, for spread)


def vid_of(path):
    return os.path.splitext(os.path.basename(path))[0]


def min_exit_after_entry(entry, bpm):
    """Earliest file start (orig time) of the mix OUT of a song entered at `entry` (orig time)."""
    return entry + 4 * 240 / bpm + HANDOVER_S


def main_hook(vid):
    """(start, end) of a song's main hook in original time, or None. Longest of the hottest stretches."""
    H = hype.Hype.load(vid)
    if not H:
        return None
    hs = [h for h in H.hooks() if h[1] - h[0] >= 6]
    if not hs:
        return None
    best = max(hs, key=lambda h: (round(h[2], 2), h[1] - h[0]))
    return best[0], best[1]


def song_term(entry, exit_, rate, hook):
    """Score of a song's stretch in the set (numpy-broadcasting over entry/exit arrays)."""
    play = (exit_ - entry) / rate
    t = -np.maximum(0, PLAY_MIN - play) * W_SHORT - np.maximum(0, play - PLAY_MAX) * W_LONG
    if hook:
        h0, h1 = hook
        t = t + W_HOOK * np.clip(np.minimum(exit_, h1) - np.maximum(entry, h0), 0, None) / (h1 - h0)
    return t


def _stage(X, cands, pre_roll):
    """Arrays for one transition stage. X = engine.pair_candidates context."""
    groups = {}
    for c in cands:                                   # cands are sorted by score
        g = groups.setdefault(round(c["tA"] / 2), [])
        if len(g) < TOP_PER_EXIT:
            g.append(c)
    keep = sorted((c for g in groups.values() for c in g), key=lambda c: -c["score"])[:TOP_TOTAL]
    r, bar_s = X["a_rate"], 240 / X["A"]["tempo"]
    return {
        "X": X, "c": keep,
        "score": np.array([c["score"] for c in keep]),
        "exit": np.array([c["tA"] * r for c in keep]),                         # A's last word, orig
        "fs": np.array([(c["tH"] - 8 * bar_s - pre_roll) * r for c in keep]),  # mix file start, orig
        "entry": np.array([c["tH_B"] for c in keep]),                          # B's drop, orig
    }


def choose(X0, cands0, chain_paths, a_entry, pre_roll, pair_candidates):
    """Pick the A->B candidate that leads to the best chain. Returns (candidate, diag).
    chain_paths: audio of the songs after B (C, D...), already prepped. pair_candidates: engine function."""
    stages = [_stage(X0, cands0, pre_roll)]
    prev = X0
    for p in chain_paths:
        X = pair_candidates(prev["b_path"], p, a_rate=prev["k"])
        stages.append(_stage(X, X["every"], pre_roll))
        prev = X
    hooks = [main_hook(vid_of(s["X"]["a_path"])) for s in stages]   # song played in stage i is its A

    # backward pass: V[i][j] = best total from stage i candidate j to the end of the chain
    n = len(stages)
    V = [None] * n
    nxt = [None] * n
    reach = [None] * n                                             # best continuation (-inf = no way out)
    V[-1] = stages[-1]["score"].copy()
    for i in range(n - 1, 0, -1):
        S0, S1, X1 = stages[i - 1], stages[i], stages[i]["X"]
        rate, bpm = X1["a_rate"], X1["A"]["tempo"] / X1["a_rate"]
        e = S0["entry"][:, None]                                   # song i entered by stage i-1's candidate
        T = song_term(e, S1["exit"][None, :], rate, hooks[i]) + V[i][None, :]
        ok = S1["fs"][None, :] >= min_exit_after_entry(e, bpm)
        T = np.where(ok, T, -np.inf)
        best = T.max(axis=1) if T.shape[1] else np.full(len(S0["c"]), -np.inf)
        nxt[i - 1] = T.argmax(axis=1) if T.shape[1] else None
        reach[i - 1] = best
        V[i - 1] = S0["score"] + np.where(np.isfinite(best), best, NO_EXIT)
    total = V[0] + (song_term(a_entry, stages[0]["exit"], X0["a_rate"], hooks[0]) if a_entry is not None else 0)
    j = int(np.argmax(total))

    # the chosen path, for the log (and to compare with what the greedy pick would have led to)
    def path_from(j0):
        out, j_ = [], j0
        for i in range(n):
            S = stages[i]
            c = S["c"][j_]
            out.append({"song": vid_of(S["X"]["a_path"]), "next": vid_of(S["X"]["b_path"]),
                        "exit": round(float(S["exit"][j_]), 1), "entry_next": round(float(S["entry"][j_]), 1),
                        "score": round(float(S["score"][j_]), 2), "b_sec": c.get("b_sec"), "a_sec": c.get("a_sec")})
            if i + 1 < n:
                if nxt[i] is None or not np.isfinite(reach[i][j_]):
                    break
                j_ = int(nxt[i][j_])
        for i in range(1, len(out)):                     # time in the set of each middle song
            s = stages[i]["X"]
            e, x = out[i - 1]["entry_next"], out[i]["exit"]
            out[i]["entered"] = e
            out[i]["play_s"] = round((x - e) / s["a_rate"], 1)
            h = hooks[i]
            out[i]["hook"] = [round(h[0], 1), round(h[1], 1)] if h else None
            out[i]["hook_in"] = round(float(song_term(e, x, s["a_rate"], h) - song_term(e, x, s["a_rate"], None)) / W_HOOK, 2) if h else None
        return out

    greedy = 0                                            # stage 0 candidates are score-sorted: index 0 = greedy pick
    diag = {"depth": n, "total": round(float(total[j]), 2), "greedy_total": round(float(total[greedy]), 2),
            "path": path_from(j), "greedy_path": path_from(greedy) if j != greedy else None}
    return stages[0]["c"][j], diag
