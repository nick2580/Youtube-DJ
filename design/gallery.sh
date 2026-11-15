#!/bin/bash
# usage: design/gallery.sh [state] [extra query]  — regenerates docs/screenshots/*.jpg and worlds.gif for the README.
# Default: every world mid-blend (blending, p=0.5). Needs Chrome (see shot.sh) and ffmpeg.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(dirname "$HERE")"; OUT="$ROOT/docs/screenshots"
STATE="${1:-blending}"; EXTRA="${2:-&p=0.5}"
TMP="$(mktemp -d)"; export SHOTDIR="$TMP"
WORLDS=("Neoclassical" "Y2K" "Surrealism" "Mid-Century" "Glassmorphism" "Ethereal" "Anthropomorphic" "Pixel Art" "Conceptual Sketch"
        "Japandi" "Kitsch" "Brutalism" "Cybercore" "Synthwave" "Vaporwave" "Pop Art" "Dark Magic Academia" "Pointillism")
mkdir -p "$OUT" "$TMP/seq"
for i in "${!WORLDS[@]}"; do   # sequential: parallel headless Chromes can drop frames
  W="${WORLDS[$i]}"; png="$("$HERE/shot.sh" "${W// /%20}" "$STATE" "$EXTRA")"
  slug="$(echo "$W" | tr 'A-Z ' 'a-z-')"
  ffmpeg -y -loglevel error -i "$png" -vf scale=1280:-1 -q:v 4 "$OUT/$slug.jpg"
  cp "$png" "$TMP/seq/$(printf %02d "$i").png"; echo "  $W"
done
ffmpeg -y -loglevel error -framerate 1/1.4 -i "$TMP/seq/%02d.png" \
  -vf "scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a" \
  -loop 0 "$OUT/worlds.gif"
rm -rf "$TMP"; echo "wrote $OUT"
