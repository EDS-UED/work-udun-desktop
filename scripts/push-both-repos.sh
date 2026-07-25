#!/usr/bin/env bash
# Push eds-website + udun-website-new after GitHub rename. Run in macOS Terminal (not only Cursor).
set -euo pipefail

git config --global http.version HTTP/1.1

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

if ! gh auth status 2>&1 | grep -q workflow; then
  echo "Adding workflow scope (needed for udun Pages workflow)…"
  gh auth refresh -h github.com -s repo,workflow
fi

gh auth setup-git

push_repo() {
  local dir=$1
  local name=$2
  echo "=== Pushing ${name} ==="
  git -C "$dir" -c credential.helper='!gh auth git-credential' push origin main
}

push_repo /Users/DanBaby/Projects/eds-website eds-website
push_repo /Users/DanBaby/Projects/udun-website-new udun-website-new

echo "Done. Check Actions: https://github.com/theyangsong/udun-website-new/actions"
