# Youtube-DJ (yt-dj)

**Turn a YouTube Mix into a DJ set.** A Chrome extension watches your YouTube Mix queue, a local Python helper analyses each song (tempo, key, beats, vocals, song structure), and when one song ends the next one doesn't just start — it's *mixed in*, the way a DJ would: beat-matched, on a phrase, with the vocals handed off cleanly.

> 🚧 **Building in public.** This is an early, fast-moving prototype. Expect rough edges, big refactors and breaking changes. Ideas, issues and PRs are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## How it works

```
 YouTube tab (www.youtube.com)                      Your machine
┌──────────────────────────────┐                 ┌──────────────────────────────────────┐
│ content.js                   │  chrome.runtime │ poc/server.py  (FastAPI, :8765)       │
│  • reads the Mix queue       │ ──────────────► │  • yt-dlp: download audio             │
│  • asks helper to prepare    │  background.js  │  • Demucs: separate vocal stems (GPU) │
│    the next transition       │  relays to      │  • allin1 / librosa: beats, key,      │
│  • swaps YouTube's audio for │  127.0.0.1:8765 │    sections (intro/verse/chorus…)     │
│    the rendered blend, then  │ ◄────────────── │  • engine.py: pick exit/entry points, │
│    back to the next video    │   blend audio   │    tempo-match, render the blend      │
│ ui/*.js — the "DJ view"      │                 └──────────────────────────────────────┘
└──────────────────────────────┘
```

1. While song **A** plays, the helper downloads and analyses the upcoming tracks in the background.
2. It searches for a good transition: leave A at the end of a vocal line, enter **B** at the start of one, on A's beat grid, tempo-matched (pitch preserved), with a technique chosen by key compatibility (3-band EQ blend for compatible keys, bass-drop for clashing ones).
3. It renders just the transition — `[A pre-roll][blend][B tail]` — and the extension plays it in place of YouTube's audio, then hands back to YouTube on song B. Outside the blend you hear the original audio, untouched.
4. A full-screen **DJ view** (toolbar button) shows the current and next song, the song structure and the upcoming blend, in 18 different visual "worlds" (Neoclassical, Y2K, Synthwave, Pixel Art, Brutalism, …).
5. Thumbs up/down on each blend is logged locally, so you can tune the mixing logic.

## Requirements

- **Google Chrome** (or another Chromium browser that loads unpacked extensions)
- **Python 3.10**
- **[ffmpeg](https://ffmpeg.org/download.html)** with the `rubberband` filter (most full builds include it) on your `PATH`
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** on your `PATH`
- **An NVIDIA GPU with CUDA is strongly recommended.** Demucs and allin1 run on CPU too, but preparing each song takes much longer.

Developed on Windows 11; macOS and Linux should work but are untested. Reports welcome.

## Quick start

```bash
git clone https://github.com/nick2580/Youtube-DJ.git
cd Youtube-DJ/poc
python -m venv .venv
# Windows: .venv\Scripts\activate      macOS/Linux: source .venv/bin/activate
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124   # pick yours at pytorch.org
pip install -r requirements.txt
python server.py          # helper on http://127.0.0.1:8765  (Windows: or double-click start-helper.bat)
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `extension/` folder. Open a YouTube Mix (any video → "Mix" in the sidebar) and click the yt-dj toolbar button.

Full instructions, including the optional allin1 structure analyser and troubleshooting: **[docs/SETUP.md](docs/SETUP.md)**.

## Repository layout

| Path | What it is |
|---|---|
| `extension/` | Manifest V3 Chrome extension. `content.js` = queue detection, audio handover, view model; `background.js` = relay to the helper; `ui/core.js` + `ui/t-*.js` = the DJ view and its 18 worlds; `fonts/` bundled fonts. |
| `poc/` | Local Python helper. `server.py` (HTTP API + job queue), `engine.py` (plan + render one transition), `separator.py` (Demucs), `structure.py` (allin1), `fast_analysis.py`. `dj_mix*.py` are the earlier offline prototypes the engine still imports from. |
| `poc/natten_shim/` | Pure-PyTorch stand-in for NATTEN so allin1 runs without a compiled CUDA extension. |
| `poc/analyze_set.py` | Reverse-engineers a recorded DJ set to measure how its transitions were done. |
| `design/` | Theme preview harness: `preview.html` runs every world on mock data; `shot.sh` / `check.sh` screenshot and smoke-test them with headless Chrome. |
| `docs/` | Setup and project docs. |

## Roadmap (rough)

- [ ] Clean up the prototype layering (`dj_mix_v*` → a proper `engine` package)
- [ ] One-command helper install (and a CPU-only path)
- [ ] Tests for the transition planner
- [ ] Settings UI (blend length, techniques, theme)
- [ ] macOS / Linux verification
- [ ] Smarter queue handling (skips, ads, non-music videos)

Have an idea? [Open an issue](https://github.com/nick2580/Youtube-DJ/issues).

## Legal / fair use

yt-dj runs entirely on your own machine. It downloads audio for videos you are already playing so it can analyse and blend them locally; nothing is uploaded or redistributed. Downloading content may be against YouTube's Terms of Service in your jurisdiction — you are responsible for how you use this tool. **Never commit audio files to this repository** (the `.gitignore` blocks common audio formats). This project is not affiliated with or endorsed by YouTube or Google.

## License

[MIT](LICENSE)
