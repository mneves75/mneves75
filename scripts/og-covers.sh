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
# Record which cover each copy was made from (sorted, stable): the route test fails when a cover changes but its copy
# does not. Kept outside public/ so it is not deployed.
{
  printf '{\n'
  first=1
  for cover in *.webp; do
    [ $first -eq 1 ] || printf ',\n'
    first=0
    printf '  "%s": "%s"' "${cover%.webp}" "$(shasum -a 256 "$cover" | cut -d' ' -f1)"
  done
  printf '\n}\n'
} > ../../../src/data/og-covers.json
echo "og-covers: $(ls og/*.jpg | wc -l | tr -d ' ') share copies, sources in src/data/og-covers.json"
