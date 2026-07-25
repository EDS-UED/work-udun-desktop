#!/usr/bin/env bash
# Push main to GitHub using gh credentials (avoids embedding tokens in shell history).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! gh auth status >/dev/null 2>&1; then
  echo "Not logged in to GitHub. Run: gh auth login"
  exit 1
fi

SCOPES="$(gh auth status 2>&1 || true)"
if ! printf '%s' "$SCOPES" | grep -q 'workflow'; then
  echo "Adding workflow scope (required to update .github/workflows). Complete the browser/device prompt if shown."
  gh auth refresh -h github.com -s repo,workflow || true
fi

gh auth setup-git
TOKEN="$(gh auth token)"
REMOTE="https://x-access-token:${TOKEN}@github.com/theyangsong/udun-website-new.git"

echo "Pushing main to theyangsong/udun-website-new …"
git push "$REMOTE" main
echo "Done."
