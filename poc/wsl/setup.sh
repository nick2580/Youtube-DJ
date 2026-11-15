#!/usr/bin/env bash
# yt-dj: allin1 (music structure analyzer) environment inside WSL Ubuntu, GPU-enabled.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ENV=~/ytdj-allin1
mkdir -p "$ENV" && cd "$ENV"
[ -d .venv ] || uv venv -q --python 3.10 .venv
PY="$ENV/.venv/bin/python"

echo "== torch 2.5.1 / cu124"
uv pip install -q --python "$PY" torch==2.5.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu124
"$PY" -c 'import torch; print("torch", torch.__version__, "cuda", torch.cuda.is_available(), torch.cuda.get_device_name(0))'

echo "== natten (prebuilt Linux wheel for torch 2.5 / cu124)"
uv pip install -q --python "$PY" "natten==0.17.5+torch250cu124" -f https://shi-labs.com/natten/wheels/ || \
  uv pip install -q --python "$PY" "natten==0.17.4+torch250cu124" -f https://shi-labs.com/natten/wheels/
"$PY" -c 'import natten; print("natten", natten.__version__)'

echo "== madmom + allin1"
uv pip install -q --python "$PY" cython numpy==1.26.4
uv pip install -q --python "$PY" --no-build-isolation "git+https://github.com/CPJKU/madmom"
uv pip install -q --python "$PY" allin1 soundfile
"$PY" -c 'import allin1, madmom; print("allin1 + madmom import OK")'
