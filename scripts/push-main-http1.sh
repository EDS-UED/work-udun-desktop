#!/usr/bin/env bash
# Prefer HTTP/1.1 — some environments hang on git push over HTTP/2 to github.com.
set -euo pipefail
git config --global http.version HTTP/1.1
exec bash "$(dirname "$0")/push-main.sh"
