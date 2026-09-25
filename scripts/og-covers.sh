#!/usr/bin/env bash
# JPEG share copies of the project covers: public/images/projects/<slug>.webp → public/images/projects/og/<slug>.jpg.
# Link previews read og:image, and LinkedIn documents no WebP support (several 2026 reports show it dropping WebP), so
# pages keep the WebP cover in <main> and point og:image at this 1200x750 JPEG. Run after adding or replacing a cover;
# the route test fails when a cover has no share copy of the right size. Uses macOS sips (no npm dependency).
set -euo pipefail
cd "$(dirname "$0")/../public/images/projects"
mkdir -p og
for cover in *.webp; do
  slug="${cover%.webp}"
  sips -s format jpeg -s formatOptions 80 --resampleWidth 1200 "$cover" --out "og/$slug.jpg" >/dev/null
done
# Drop share copies whose cover is gone.
for copy in og/*.jpg; do
  slug="$(basename "$copy" .jpg)"
  [ -e "$slug.webp" ] || rm -- "$copy"
done
echo "og-covers: $(ls og/*.jpg | wc -l | tr -d ' ') share copies"
