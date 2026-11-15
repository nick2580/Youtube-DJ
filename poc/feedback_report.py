"""
Summarise the thumbs up/down log written by the helper (feedback/feedback.jsonl).
    .venv\\Scripts\\python feedback_report.py            # summary
    .venv\\Scripts\\python feedback_report.py --csv out.csv   # one row per mix, for pandas/sheets

One mix is logged several times (mix end, rating, tag edits, when song B was left): the last line per mix_id
wins, but b_kept_s is taken from whichever line has it.
"""
import argparse, csv, json, os, statistics as st
from collections import Counter, defaultdict

os.chdir(os.path.dirname(os.path.abspath(__file__)))
LOG = os.path.join("feedback", "feedback.jsonl")

# score terms of the chosen candidate (dj_mix_v7.find_transition) + render numbers worth comparing up vs down
FEATURES = ["score", "a_vox", "a_rms", "b_vox", "b_rms", "level", "vox_match", "harm", "a_next"]
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
           "sync_drift_ms": (c.get("sync") or {}).get("drift_ms"), "rated_at_s_after_drop": c.get("rated_at_s_after_drop"),
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
    unrated_skips = [x for x in rows if not x["rating"] and x["b_left_how"] == "skipped_or_jumped" and (x["b_kept_s"] or 99) < 30]
    if unrated_skips:
        print(f"\n{len(unrated_skips)} unrated mixes where song B was skipped within 30 s (likely silent thumbs down):")
        for x in unrated_skips:
            print(f"  {x['a']} -> {x['b']}  kept {x['b_kept_s']} s")


if __name__ == "__main__":
    main()
