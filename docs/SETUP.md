# Setup

yt-dj has two parts that must both be running:

1. **The helper**: a local Python server (`poc/server.py`) on `http://127.0.0.1:8765` that downloads, analyses and renders transitions.
2. **The extension**: an unpacked Chrome extension (`extension/`) that runs on youtube.com and talks to the helper.

## 1. System tools

| Tool | Why | Check |
|---|---|---|
| Python **3.10** | the helper | `python --version` |
| [ffmpeg](https://ffmpeg.org/download.html) with `rubberband` | decoding, tempo-matching | `ffmpeg -filters \| grep rubberband` |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | downloading the audio of queued songs | `yt-dlp --version` |
| NVIDIA driver + CUDA (recommended) | Demucs / allin1 on GPU | `nvidia-smi` |

All three commands must be on your `PATH`. On Windows, the "full" builds from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) or [BtbN](https://github.com/BtbN/FFmpeg-Builds/releases) include rubberband. Keep yt-dlp up to date (`yt-dlp -U`); YouTube changes often break old versions.

## 2. Python helper

Always use a virtual environment: the dependency stack (numpy 2, torch, soxr, librosa) conflicts easily with global installs.

```bash
cd poc
python -m venv .venv
```

Activate it:

- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
- Windows (cmd): `.venv\Scripts\activate.bat`
- macOS / Linux: `source .venv/bin/activate`

Install PyTorch for your hardware first. Get the exact command from <https://pytorch.org/get-started/locally/>, for example:

```bash
# NVIDIA GPU (CUDA 12.4 wheels)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124
# CPU only
pip install torch torchaudio
```

Then the rest:

```bash
pip install -r requirements.txt
```

### Optional: allin1 song-structure analysis

[allin1](https://github.com/mir-aidj/all-in-one) labels sections (intro, verse, chorus, bridge, outro…), which gives better transition points and powers the structure strip in the DJ view. Without it, the helper falls back to its own fast analysis.

```bash
pip install cython
pip install --no-build-isolation "git+https://github.com/CPJKU/madmom"
pip install allin1==1.1.0
python install_natten_shim.py
```

`install_natten_shim.py` registers `poc/natten_shim` (a pure-PyTorch replacement for the NATTEN CUDA extension that allin1 expects) on the venv's `sys.path`, so no CUDA compilation is needed. Re-run it if you move the repo folder.

> Linux users who'd rather use real NATTEN wheels: see `poc/wsl/setup.sh` for a WSL/Ubuntu GPU environment.

### Run it

```bash
python server.py
```

On Windows you can double-click `start-helper.bat` in the repo root instead (it uses `poc\.venv`).

You should see `yt-dj helper ready on http://127.0.0.1:8765`. Check it in a browser: <http://127.0.0.1:8765/health>. The first start downloads the Demucs (and allin1) model weights, which takes a minute.

The helper writes its working data inside `poc/` (all git-ignored):

| Folder | Contents |
|---|---|
| `cache/` | downloaded audio (`<videoId>.wav`), tempo-matched variants, analysis pickles |
| `stems/htdemucs/` | Demucs stems per track |
| `struct/` | allin1 results per track |
| `feedback/` | your thumbs up/down log (`feedback.jsonl`) and the rated blends |

These grow fast (tens of MB per song). Delete `cache/` and `stems/` any time to reclaim space.

## 3. Chrome extension

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `extension/` folder.
4. Pin the yt-dj icon to the toolbar.

After editing extension code, click the reload ↻ icon on the extension card and refresh the YouTube tab.

## 4. Use it

1. Start the helper.
2. Open any song on YouTube and start its **Mix** (the auto-generated "Mix – …" playlist in the sidebar), so the URL has `list=RD…`.
3. The extension starts preparing the queue in the background. Click the toolbar icon to open the DJ view; use the arrows at the top left to switch worlds.
4. When the current song approaches its exit point, the blend plays automatically. Rate it with 👍 / 👎.

See your ratings with `python poc/feedback_report.py` (or `--csv out.csv`).

## Troubleshooting

| Symptom | Fix |
|---|---|
| DJ view says helper **offline** | Is `server.py` running? Does <http://127.0.0.1:8765/health> respond? Reload the extension. |
| Songs stuck on "downloading" | Update yt-dlp (`yt-dlp -U`); run `yt-dlp <video url>` manually to see the error. |
| `rubberband` filter not found | Your ffmpeg build lacks librubberband. Install a full build. |
| Very slow preparation | You're on CPU. Check `python -c "import torch; print(torch.cuda.is_available())"`. |
| `UnicodeEncodeError` in the console on Windows | Use a recent version of `server.py` (it forces UTF-8 output), or set `PYTHONUTF8=1`. |
| numpy / soxr import errors | You're not in the venv. Activate `poc/.venv`. |
| Songs longer than 10 minutes are skipped | Intentional (`MAX_LEN` in `server.py`): those are usually compilations, not songs. |

## Working on the DJ view without YouTube

`design/preview.html` loads all worlds on mock data. Open it directly in Chrome (`file://`) with `?theme=<Name>&kind=<state>`, where state is one of `armed`, `blending`, `analysing`, `arrival`, `offline` or `idle`. From a bash shell (Git Bash on Windows):

```bash
design/shot.sh Synthwave blending    # prints the path of a 1600×900 screenshot
design/check.sh Synthwave Y2K        # reports script errors in every state
```

Set `CHROME=/path/to/chrome` if Chrome isn't at the default Windows location, and `SHOTDIR` to choose where screenshots go.
