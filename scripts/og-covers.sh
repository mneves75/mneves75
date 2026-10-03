#!/usr/bin/env bash
# Derived copies of the project covers: JPEG share copies (public/images/projects/og/<slug>.jpg) and 400w/800w WebP
# copies for srcset (public/images/projects/400/, 800/). For the share copies:
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
# Smaller WebP copies for srcset (400/<slug>.webp, 800/<slug>.webp): a phone shows a cover 300-360px wide and a work
# row 120-190px wide, so the 1600px original was a project page's slowest paint. Needs cwebp (brew install webp).
for width in 400 800; do
  mkdir -p "$width"
  for cover in *.webp; do
    cwebp -quiet -q 80 -resize "$width" 0 -metadata none "$cover" -o "$width/$cover"
  done
done
# Drop copies whose cover is gone.
for copy in og/*.jpg; do
  slug="$(basename "$copy" .jpg)"
  [ -e "$slug.webp" ] || rm -- "$copy"
done
for copy in 400/*.webp 800/*.webp; do
  [ -e "$(basename "$copy")" ] || rm -- "$copy"
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
echo "og-covers: $(ls og/*.jpg | wc -l | tr -d ' ') share copies, $(ls 400/*.webp 800/*.webp | wc -l | tr -d ' ') srcset copies, sources in src/data/og-covers.json"
