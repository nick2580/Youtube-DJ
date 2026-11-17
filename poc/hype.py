"""
Hype map: YouTube's "Most replayed" graph for a song, used to pick the moments listeners love.

yt-dlp reads it from the watch page as `heatmap`: ~100 segments covering the video, each with a value in 0..1
(1 = the most replayed moment). There is no official API for it, so everything here degrades to "no hype"
when it is missing (low-view uploads) or when YouTube changes the page.

How the mix uses it (engine.apply_hype):
  * B enters on a hot stretch: the listener lands on the hook people replay, not just any chorus start.
  * A leaves after its first big hook has played, preferably right as a hot stretch ends.
The first seconds of every video read hot only because people press play there, so they are ignored.
"""
import json, os, subprocess, time

import numpy as np

CACHE = "cache"
_pause_until = 0.0
SKIP_START = 0.08          # fraction of the song ignored at the start (the "pressed play" bump)
HOOK_LEVEL = 0.85          # a hook = a stretch at >= 85% of the song's hottest point


def path_for(vid):
    return os.path.join(CACHE, f"{vid}.heat.json")


def fetch(vid, timeout=25):
    """Download and cache the heatmap for one video. Returns the raw list ([] when YouTube has none).
    Network failures are not cached, so the next prepare tries again."""
    global _pause_until
    p = path_for(vid)
    if os.path.exists(p):
        return json.load(open(p))
    if time.time() < _pause_until:       # YouTube pushed back recently: don't add to it, mix without hype
        return None
    try:
        out = subprocess.run(["yt-dlp", "-j", "--skip-download", "--no-warnings", "--no-playlist",
                              f"https://www.youtube.com/watch?v={vid}"], capture_output=True, text=True, timeout=timeout)
        info = json.loads(out.stdout)
    except Exception:
        _pause_until = time.time() + 600  # bot check / offline: back off for 10 minutes
        return None
    heat = [{"start": float(x["start_time"]), "end": float(x["end_time"]), "value": float(x["value"])}
            for x in (info.get("heatmap") or [])]
    json.dump(heat, open(p, "w"))
    return heat


class Hype:
    """Heat profile of one song in its ORIGINAL timeline; scaled(r) gives it in a session played at speed r."""

    def __init__(self, heat, r=1.0):
        h = sorted(heat, key=lambda x: x["start"])
        self.t0 = np.array([x["start"] for x in h]) / r
        self.t1 = np.array([x["end"] for x in h]) / r
        v = np.array([x["value"] for x in h])
        body = v[int(len(v) * SKIP_START):]
        self.v = v
        # percentile of each point among the song body: robust to how "peaky" a song's graph is
        self.pct = np.array([float(np.mean(body <= x)) for x in v])
        self.pct[:int(len(v) * SKIP_START)] = 0.0
        self.top = float(body.max()) if len(body) else 0.0
        self.dur = float(self.t1[-1]) if len(h) else 0.0

    @classmethod
    def load(cls, vid, r=1.0):
        p = path_for(vid)
        if not os.path.exists(p):
            return None
        heat = json.load(open(p))
        return cls(heat, r) if len(heat) >= 20 else None

    def level(self, a, b):
        """Mean heat percentile (0..1) over [a, b)."""
        m = (self.t1 > a) & (self.t0 < b)
        return float(self.pct[m].mean()) if m.any() else 0.0

    def hooks(self):
        """Hot stretches as [(start, end, peak_value)], in time order (start bump excluded)."""
        hot = (self.v >= HOOK_LEVEL * self.top) & (np.arange(len(self.v)) >= int(len(self.v) * SKIP_START))
        out, k = [], 0
        while k < len(hot):
            if hot[k]:
                e = k
                while e + 1 < len(hot) and hot[e + 1]:
                    e += 1
                out.append((float(self.t0[k]), float(self.t1[e]), float(self.v[k:e + 1].max())))
                k = e + 1
            else:
                k += 1
        return out

    def first_hook_end(self):
        h = self.hooks()
        return h[0][1] if h else None

    def summary(self, r=1.0):
        """For the plan / feedback log, in ORIGINAL (YouTube) time."""
        return {"hooks": [[round(a * r, 1), round(b * r, 1), round(p, 2)] for a, b, p in self.hooks()]}
