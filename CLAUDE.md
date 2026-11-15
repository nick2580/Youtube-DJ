# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repository. Human contributors should read [CONTRIBUTING.md](CONTRIBUTING.md) too.

## What this is

yt-dj is a Chrome extension plus a local Python helper that turns a YouTube Mix into a DJ set: it analyses the queued songs and blends each song into the next (beat-matched, phrase-aligned, vocals handed off cleanly). The project is built in public: everything committed is public.

## Architecture

- `extension/` is a Manifest V3 extension, plain JS with no build step.
  - `content.js` (runs on youtube.com): detects the Mix queue, asks the helper to `/warm` upcoming tracks and `/prepare` a→b transitions, fetches `/blend` audio, and swaps YouTube's audio for the blend during the transition. It also builds the view model the UI draws.
  - `background.js` relays every helper request (`chrome.runtime.sendMessage` → `fetch http://127.0.0.1:8765`) to avoid CORS and private-network limits. Binary responses come back base64-encoded.
  - `ui/core.js` is the DJ-view shell (overlay, world switching, shared video frame, frame loop). Each `ui/t-*.js` registers a world with `YTDJ.theme(name, def)`. New world files must also be added to `manifest.json` `content_scripts.js` and to `design/preview.html`.
- `poc/` is the helper (Python 3.10, FastAPI on 127.0.0.1:8765).
  - `server.py`: HTTP API (`/health`, `/warm`, `/prepare`, `/plan`, `/blend`, `/feedback`, `/art/{vid}`), the download→separate→analyse job queue, and one GPU worker thread with priorities.
  - `engine.py`: plans and renders one transition. Output layout is `[pre_roll of A untouched][blend][tail of B untouched, tempo-matched]`.
  - `engine.py` imports from `dj_mix.py`, `dj_mix_v3.py`, `dj_mix_v5.py` and `dj_mix_v7.py`. These are the earlier offline prototypes and are still load-bearing, so don't delete them without moving what's imported. `dj_mix_v4.py` and `dj_mix_v6.py` are history.
  - `separator.py` keeps Demucs `htdemucs` warm on the GPU and writes `stems/htdemucs/<name>/*.wav`. `structure.py` wraps allin1 (optional; `AVAILABLE` flag). `fast_analysis.py` does the seconds-not-minutes analysis.
  - `natten_shim/` is a pure-PyTorch NATTEN replacement for allin1, registered by `install_natten_shim.py`.
- `design/` is a preview harness for the DJ-view worlds on mock data (`preview.html`, `shot.sh`, `check.sh`).

## Running things

- Helper: `cd poc && .venv/Scripts/python server.py` (Windows) or `.venv/bin/python server.py`. Always use the venv, because global Python installs hit numpy/soxr conflicts.
- Extension: load `extension/` unpacked. After changes, reload it in `chrome://extensions` and refresh the YouTube tab.
- UI check without YouTube: `design/check.sh <World>...` for script errors, `design/shot.sh <World> <state>` for a screenshot. States: `armed blending analysing arrival offline idle`. Headless captures land about 1 s in, so entry animations show mid-flight.
- README screenshots: `design/gallery.sh` regenerates `docs/screenshots/*.jpg` and the hero `worlds.gif`. Re-run it after visible changes to a world, and add new worlds to its list.
- Ratings summary: `poc/.venv/Scripts/python poc/feedback_report.py`.

## How quality is judged

- **Mixes**: listening is the real test. When changing transition logic, say what should sound different and render an example. Numbers alone don't prove a blend is good.
- **DJ view**: each world is its own design from first principles (its own metaphor, layout and video treatment), not one layout re-skinned. Screenshot your changes with `design/shot.sh` and look at them before calling UI work done.

## Rules

- **Never commit audio, stems, caches or feedback data.** It's copyrighted music and personal listening data. `.gitignore` covers `poc/cache`, `stems`, `struct`, `feedback`, `out*` and audio extensions. Check `git status` before committing.
- **Never commit secrets.** `.secrets/` and `.env*` are ignored. Don't hardcode tokens, personal paths (`C:/Users/<name>/…`) or emails. Scripts must resolve paths relative to themselves.
- The helper must only listen on `127.0.0.1`.
- Keep the extension build-free (no bundler) unless there's a strong reason and the change is discussed in an issue first.
- Untouched audio outside the blend is a core design rule: B is never pitch-shifted, and A before the blend is the original.
- Commit messages: short imperative summary line, with the body explaining why.
