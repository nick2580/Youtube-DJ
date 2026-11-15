#!/bin/bash
# usage: design/check.sh <Theme>...  — loads every world in several states with mock data and prints any script errors
# Set CHROME to your Chrome/Chromium binary if it isn't at the default Windows location.
HERE="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
PREVIEW="file:///$(cygpath -m "$HERE" 2>/dev/null || echo "$HERE")/preview.html"
PREVIEW="${PREVIEW// /%20}"
for t in "$@"; do for k in armed blending analysing arrival offline idle; do
"$CHROME" --headless=new --disable-gpu-sandbox --window-size=1600,900 --allow-file-access-from-files --virtual-time-budget=1500 --enable-logging=stderr --dump-dom "$PREVIEW?theme=$t&kind=$k" 2>&1 >/dev/null | grep -iE "yt-dj ui|Uncaught|TypeError|ReferenceError|SyntaxError" | head -2 | sed "s/^/$t $k: /"; done; done; echo "checked $# worlds"
