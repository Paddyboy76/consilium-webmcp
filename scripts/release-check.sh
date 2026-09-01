#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
skip_install=false
skip_http=false
for argument in "$@"; do
  case "$argument" in
    --skip-install) skip_install=true ;;
    --skip-http) skip_http=true ;;
    *) echo "Unknown argument: $argument" >&2; exit 2 ;;
  esac
done
temp_dir="$(mktemp -d /tmp/consilium-release.XXXXXX)"
trap 'rm -rf -- "$temp_dir"' EXIT INT TERM
cd "$project_dir"

if $skip_install; then echo 'SKIP     dependency install (existing lockfile install)'; else echo 'RELEASE  dependency install'; npm ci; fi
echo 'RELEASE  static checks'
npm run check
echo 'RELEASE  meaningful tests'
npm test
echo 'RELEASE  Worker build/dry-run (no deployment)'
XDG_CONFIG_HOME="$temp_dir/xdg" npm run deploy:check
echo 'RELEASE  patch hygiene'
git diff --check
if $skip_http; then
  echo 'SKIP     local HTTP acceptance (socket-restricted sandbox only)'
  echo 'RESULT   in-sandbox release checks passed; supervisor HTTP acceptance remains required'
else
  echo 'RELEASE  local HTTP acceptance'
  npm run acceptance:hetzner
  echo 'RESULT   Hetzner release-candidate checks passed, including real local HTTP'
fi
