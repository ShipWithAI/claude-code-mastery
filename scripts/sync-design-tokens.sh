#!/usr/bin/env bash
# Re-vendor the ShipWithAI design-system tokens into src/styles/tokens.css.
#
# The design system is a private GitHub Package (@mangalahq/shipwithai-sot-design).
# This repo is public and must stay installable without a registry token, so we
# vendor the compiled CSS instead of depending on the package.
#
# Usage:
#   ./scripts/sync-design-tokens.sh                # default: sibling shipwithai.io checkout
#   DESIGN_PKG_DIR=/path/to/node_modules/@mangalahq/shipwithai-sot-design ./scripts/sync-design-tokens.sh
set -euo pipefail
cd "$(dirname "$0")/.."

DESIGN_PKG_DIR="${DESIGN_PKG_DIR:-../shipwithai.io/node_modules/@mangalahq/shipwithai-sot-design}"
SRC="$DESIGN_PKG_DIR/dist/tokens.css"
DEST="src/styles/tokens.css"

if [ ! -f "$SRC" ]; then
  echo "tokens.css not found at $SRC" >&2
  echo "Set DESIGN_PKG_DIR to a directory containing the installed package." >&2
  exit 1
fi

VERSION="$(node -p "require('$DESIGN_PKG_DIR/package.json').version")"
DATE="$(date +%Y-%m-%d)"

{
  echo "/* VENDORED from @mangalahq/shipwithai-sot-design@${VERSION} (dist/tokens.css) on ${DATE}."
  echo "   DO NOT EDIT BY HAND — run scripts/sync-design-tokens.sh to update. */"
  cat "$SRC"
} > "$DEST"

echo "✅ wrote $DEST from @mangalahq/shipwithai-sot-design@${VERSION}"
