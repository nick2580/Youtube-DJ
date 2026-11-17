#!/bin/bash
# Recreates the gitignored vendor/ and models/ for the spike: onnxruntime-web, demucs-web, and the htdemucs ONNX
# models from Hugging Face (fp32 single file ~172 MB, fp16 21-piece split ~121 MB, both MIT).
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
T="$(mktemp -d)"
(cd "$T" && npm pack onnxruntime-web@1.31.1 demucs-web@1.0.2 -q >/dev/null)
mkdir -p vendor models/split
for p in "onnxruntime-web-1.31.1:ort" "demucs-web-1.0.2:demucs-web"; do
  rm -rf "$T/package" "vendor/${p#*:}"; (cd "$T" && tar -xzf "${p%%:*}.tgz"); mv "$T/package" "vendor/${p#*:}"
done
rm -rf "$T"
[ -f models/htdemucs_embedded.onnx ] || curl -fsSL -o models/htdemucs_embedded.onnx \
  https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx
B=https://huggingface.co/monteslu/htdemucs-web-onnx/resolve/main
curl -fsSL -o models/split/htdemucs_split_manifest.json $B/htdemucs_split_manifest.json
for i in $(seq -w 0 20); do [ -f models/split/htdemucs_p$i.onnx ] || curl -fsSL -o models/split/htdemucs_p$i.onnx $B/htdemucs_p$i.onnx & done; wait
echo "ready: $(du -sh models | cut -f1) of models"
