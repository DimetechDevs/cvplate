#!/usr/bin/env bash
# Regenerates template thumbnails in public/thumbs from the sample CV.
set -euo pipefail
cd "$(dirname "$0")/.."
npx tsx --tsconfig scripts/tsconfig.json scripts/render-samples.tsx >/dev/null
mkdir -p public/thumbs
for f in out/*.pdf; do
  id=$(basename "$f" .pdf)
  pdftoppm -png -f 1 -l 1 -scale-to-x 480 -scale-to-y -1 "$f" "out/thumb-$id"
  mv "out/thumb-$id-1.png" "public/thumbs/$id.png"
done
