"""
Summarise the thumbs up/down log written by the helper (feedback/feedback.jsonl).
    .venv\\Scripts\\python feedback_report.py            # summary
    .venv\\Scripts\\python feedback_report.py --csv out.csv   # one row per mix, for pandas/sheets

One mix is logged several times (mix end, rating, tag edits, when song B was left): the last line per mix_id
wins, but b_kept_s is taken from whichever line has it.
"""
import argparse, csv, json, math, os, statistics as st, sys
from collections import Counter, defaultdict

os.chdir(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):      # song titles don't fit cp1252, the Windows console default
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
LOG = os.path.join("feedback", "feedback.jsonl")

# score terms of the chosen candidate (dj_mix_v7.find_transition) + render numbers worth comparing up vs down
FEATURES = ["score", "a_vox", "a_rms", "b_vox", "b_rms", "level", "vox_match", "harm", "a_next", "hype_b", "hype_a_before"]
RENDER = ["camelot_score", "stretch_pct", "gain_b_over_a", "align_shift_ms", "peak_before_limit", "chosen_rank_overall", "cands_after_min_exit"]


def load():
    mixes = {}
    for line in open(LOG, encoding="utf-8"):
        try:
            r = json.loads(line)
        except ValueError:
            continue
        old = mixes.get(r["mix_id"], {})
        kept = r["client"].get("b_kept_s") if r["client"].get("b_kept_s") is not None else old.get("client", {}).get("b_kept_s")
        how = r["client"].get("b_left_how") or old.get("client", {}).get("b_left_how")
        if r.get("event") == "left_b" and old:        # a late implicit signal must not erase a rating
            r = dict(old, client=dict(old["client"]))
        r["client"]["b_kept_s"], r["client"]["b_left_how"] = kept, how
        mixes[r["mix_id"]] = r
    return list(mixes.values())


def row(r):
    P, d, c = r.get("plan") or {}, (r.get("plan") or {}).get("diag") or {}, r["client"]
    ch = d.get("chosen") or {}
    out = {"mix_id": r["mix_id"], "ts": r["ts"], "rating": r.get("rating") or "", "tags": "; ".join(r.get("tags") or []),
           "a": (c.get("a") or {}).get("title", r["a"]), "b": (c.get("b") or {}).get("title", r["b"]),
           "style": P.get("style"), "outcome": c.get("outcome"), "why": c.get("why"),
           "exit_section": P.get("exit_section"), "entry_section": P.get("entry_section"),
           "bpm_a": d.get("bpm_a_orig"), "bpm_b": d.get("bpm_b"), "key_a": (d.get("key_a") or {}).get("camelot"), "key_b": (d.get("key_b") or {}).get("camelot"),
           "stretch_pct": round((P.get("k", 1) - 1) * 100, 2) if P else None, "a_rate": P.get("a_rate"),
           "on_down": ch.get("on_down"), "exit_at": P.get("exit_a_orig"), "entry_at": P.get("entry_b_orig"),
           "b_kept_s": c.get("b_kept_s"), "b_left_how": c.get("b_left_how"), "paused": c.get("paused_during_mix"),
           "stretch_capped": d.get("stretch_capped"),
           "sync_drift_ms": (c.get("sync") or {}).get("drift_ms"), "sync_ms": (c.get("sync") or {}).get("ms"),
           "vol_b_pred": (c.get("level") or {}).get("b_pred"), "vol_b_actual": (c.get("level") or {}).get("b_actual"),
           "ui_glitches": len((c.get("ui_check") or {}).get("bad") or []), "rated_at_s_after_drop": c.get("rated_at_s_after_drop"),
           "blend_file": r.get("blend_file")}
    out.update({f: ch.get(f) for f in FEATURES})
    out.update({f: d.get(f) for f in RENDER if f != "stretch_pct"})
    return out


def pct(n, d):
    return f"{100 * n / d:.0f}%" if d else "-"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv")
    args = ap.parse_args()
    if not os.path.exists(LOG):
        return print("no feedback yet:", LOG)
    rows = [row(r) for r in load()]
    if args.csv:
        with open(args.csv, "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
        print("wrote", len(rows), "mixes to", args.csv)

    rated = [x for x in rows if x["rating"]]
    up, down = [x for x in rated if x["rating"] == "up"], [x for x in rated if x["rating"] == "down"]
    print(f"{len(rows)} mixes logged, {len(rated)} rated: {len(up)} up, {len(down)} down")
    print(f"handovers: {Counter(x['outcome'] for x in rows)}")

    def by(key, fn=lambda v: v):
        g = defaultdict(lambda: [0, 0])
        for x in rated:
            g[fn(x[key])][x["rating"] == "up"] += 1
        for k, (dn, u) in sorted(g.items(), key=lambda kv: str(kv[0])):
            print(f"  {str(k):<28} {u:>3} up {dn:>3} down   {pct(u, u + dn)} liked")

    if rated:
        print("\nby technique"); by("style")
        print("\nby key fit (camelot score)"); by("camelot_score", lambda v: "none" if v is None else ">=0.85 compatible" if v >= 0.85 else "<0.85 clash-risk")
        print("\nby tempo stretch"); by("stretch_pct", lambda v: "none" if v is None else "0" if v == 0 else "<=2%" if abs(v) <= 2 else ">2%")
        print("\nby A already time-stretched by the previous mix"); by("a_rate", lambda v: "none" if v is None else "a_rate = 1" if abs(v - 1) < 1e-3 else "a_rate != 1")
        print("\nby tempo gap too big to match (> 4%)"); by("stretch_capped")
        print("\nby handover on A's downbeat"); by("on_down")
        print("\nby exit section"); by("exit_section")
        print("\nby entry section"); by("entry_section")
        print("\nmean of each score term, up vs down (big gaps = terms worth re-weighting)")
        for f in FEATURES + [r for r in RENDER] + ["b_kept_s", "sync_drift_ms"]:
            mu = [x[f] for x in up if isinstance(x[f], (int, float))]
            md = [x[f] for x in down if isinstance(x[f], (int, float))]
            if mu or md:
                print(f"  {f:<22} up {st.mean(mu) if mu else float('nan'):>8.3f}   down {st.mean(md) if md else float('nan'):>8.3f}")
        tags = Counter(t for x in down for t in x["tags"].split("; ") if t)
        if tags:
            print("\nwhat felt off:"); [print(f"  {n:>3}  {t}") for t, n in tags.most_common()]
        tags = Counter(t for x in up for t in x["tags"].split("; ") if t)
        if tags:
            print("\nwhat worked:"); [print(f"  {n:>3}  {t}") for t, n in tags.most_common()]
        if down:
            print("\nthumbs down (re-listen with the blend file):")
        for x in down:
            print(f"  {x['ts']}  {x['a']} -> {x['b']}  [{x['style']}, {x['exit_section']} -> {x['entry_section']}]  {x['tags']}\n      {x['blend_file']}")
    # handover health over every mix: sync should lock (< 25 ms) before its timeout, and B's level predicted
    # from loudness should match the volume YouTube actually gave B
    dr = [abs(x["sync_drift_ms"]) for x in rows if isinstance(x["sync_drift_ms"], (int, float))]
    if dr:
        print(f"\nhandover sync: median |drift| {st.median(dr):.0f} ms, {sum(d < 25 for d in dr)}/{len(dr)} locked under 25 ms")
    lv = [(x["vol_b_pred"], x["vol_b_actual"]) for x in rows if x["vol_b_pred"] and x["vol_b_actual"]]
    if lv:
        err = [abs(20 * math.log10(p / a)) for p, a in lv]
        print(f"B level prediction: median error {st.median(err):.2f} dB, worst {max(err):.2f} dB over {len(err)} mixes")
    gl = [x for x in rows if x["ui_glitches"]]
    if gl:
        print(f"{len(gl)} mixes where the DJ view was off screen during the switch (client.ui_check in the log)")
    unrated_skips = [x for x in rows if not x["rating"] and x["b_left_how"] == "skipped_or_jumped" and (x["b_kept_s"] or 99) < 30]
    if unrated_skips:
        print(f"\n{len(unrated_skips)} unrated mixes where song B was skipped within 30 s (likely silent thumbs down):")
        for x in unrated_skips:
            print(f"  {x['a']} -> {x['b']}  kept {x['b_kept_s']} s")


if __name__ == "__main__":
    main()
