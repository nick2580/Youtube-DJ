# Contributing to yt-dj

Thanks for your interest! This project is built in public and is still an early prototype, so there's lots to do and the code moves quickly.

## Ways to help

- **Try it and report what broke.** Bug reports with your OS, GPU (or CPU-only) and the helper's console output are gold.
- **Rate blends and share what sounded wrong.** "Vocals clashed at the handoff" or "the drop came in a bar late" helps tune the engine.
- **Design a new DJ-view world.** See `extension/ui/t-*.js` and the preview harness in `design/`.
- **Improve the engine.** Transition search, key handling, tempo matching, new techniques.
- **Docs, setup scripts, macOS/Linux testing.**

Check [open issues](https://github.com/nick2580/Youtube-DJ/issues) first. Issues labelled `good first issue` are a good starting point. For anything large, please open an issue to discuss before writing lots of code.

## Development setup

Follow [docs/SETUP.md](docs/SETUP.md). In short: run the helper from `poc/` in its venv, and load `extension/` as an unpacked extension.

## Pull requests

1. Fork, then branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Keep PRs focused: one change per PR.
3. Describe **what** changed and **why**. For mixing changes, say what should sound different and how you tested it. For UI changes, include screenshots (`design/shot.sh` helps).
4. Make sure you are **not committing** audio files, caches, stems, `feedback/` data, secrets or personal paths. Run `git status` before you push.

## Code style

- **JavaScript**: plain ES2020+, no build step, 2-space indent. Each world in `ui/` is self-contained and registers via `YTDJ.theme()`.
- **Python**: 3.10, 4-space indent, keep functions small, docstrings explain *why*. The helper must keep working when optional deps (allin1) are missing.

## Code of conduct

Be kind, assume good intent, and keep feedback about the work. Harassment of any kind isn't tolerated. Maintainers may remove comments or contributors that break this.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
