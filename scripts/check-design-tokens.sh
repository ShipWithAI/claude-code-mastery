#!/usr/bin/env bash
# Design-token lint gate for course.shipwithai.io.
# Fails if light-theme rules or indigo (banned by DESIGN.md) survive in src/.
# tokens.css is excluded: it is vendored verbatim from the design system.
set -u
cd "$(dirname "$0")/.."

fail=0
report() { echo "❌ $1"; fail=1; }

# 1. No light theme selectors anywhere in src/
if grep -rn --include='*.css' --include='*.astro' --include='*.js' --include='*.ts' \
     -E 'data-theme=.light.' src --exclude=tokens.css; then
  report "light-theme rules found (see above)"
fi

# 2. No indigo / cool-grey brand colours from the pre-DS palette
if grep -rni --include='*.css' --include='*.astro' --include='*.js' --include='*.ts' \
     -E '#818CF8|#6366F1|#4F46E5|#4338CA|#312E81|rgba\(129, ?140, ?248|rgba\(99, ?102, ?241|#0B0F19|#111827|#1F2937|#F9FAFB|#e0e7ff' \
     src --exclude=tokens.css; then
  report "banned pre-DS colours found (see above)"
fi

# 3. IBM Plex must be gone (DS body font is Inter)
if grep -rni --include='*.css' --include='*.mjs' --include='*.js' --include='*.json' \
     'ibm-plex\|IBM Plex' src astro.config.mjs package.json; then
  report "IBM Plex references found (see above)"
fi

# 4. tokens.css must exist and carry the provenance header
if ! head -3 src/styles/tokens.css 2>/dev/null | grep -q 'shipwithai-sot-design'; then
  report "src/styles/tokens.css missing or lacks provenance header"
fi

if [ "$fail" -eq 0 ]; then echo "✅ design-token gate clean"; fi
exit $fail
