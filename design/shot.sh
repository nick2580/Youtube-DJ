#!/bin/bash
# usage: design/shot.sh <Theme> <kind> [extra query] -> prints path of a png screenshot
# Env: CHROME (browser binary), SHOTDIR (output dir, default /tmp), SIZE (WxH), VT (virtual-time ms)
HERE="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
PREVIEW="file:///$(cygpath -m "$HERE" 2>/dev/null || echo "$HERE")/preview.html"
PREVIEW="${PREVIEW// /%20}"
OUT="${SHOTDIR:-/tmp}/$(echo "$1-$2$4" | tr ' ' '_').png"
OUTARG="$(cygpath -w "$OUT" 2>/dev/null || echo "$OUT")"
"$CHROME" --headless=new --disable-gpu-sandbox --hide-scrollbars --window-size=${SIZE:-1600,900} \
  --allow-file-access-from-files --virtual-time-budget=${VT:-6000} --screenshot="$OUTARG" \
  "$PREVIEW?theme=$1&kind=$2$3" >/dev/null 2>&1
echo "$OUT"
