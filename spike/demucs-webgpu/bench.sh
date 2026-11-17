#!/bin/bash
# usage: spike/demucs-webgpu/bench.sh <vid> <ep: webgpu|wasm> [power: high-performance|low-power] [secs, 0 = whole song]
# Needs serve.py running (python spike/demucs-webgpu/serve.py). Runs one separation in headless Chrome and
# MODEL=models/split runs the fp16 split chain. Prints the timing JSON (extra Chrome flags via CHROME_FLAGS, e.g. --use-webgpu-power-preference=force-low-power); the vocals land in out/ for compare.py.
HERE="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
VID="$1"; EP="${2:-webgpu}"; PW="${3:-high-performance}"; SECS="${4:-0}"
TAG="$VID.$EP"; [ "$EP" = webgpu ] && TAG="$TAG.$PW"
[ -n "$MODEL" ] && TAG="$TAG.split"; [ -n "$VOX" ] && TAG="$TAG.vox"; [ -n "$ORT" ] && TAG="$TAG.$ORT"
OUTJ="$HERE/out/$TAG.json"; rm -f "$OUTJ"
PROFILE="$(mktemp -d)"
"$CHROME" --headless=new --user-data-dir="$PROFILE" --enable-unsafe-webgpu --no-first-run $CHROME_FLAGS \
  "http://127.0.0.1:8790/run.html?vid=$VID&ep=$EP&power=$PW&secs=$SECS${MODEL:+&model=$MODEL}${ORT:+&ort=$ORT}${VOX:+&vox=1}" >/dev/null 2>&1 &
PID=$!
for _ in $(seq 1 400); do [ -f "$OUTJ" ] && break; sleep 3; done
sleep 1; kill $PID 2>/dev/null; wait $PID 2>/dev/null; rm -rf "$PROFILE"
cat "$OUTJ" 2>/dev/null || echo "no result (timed out)"
