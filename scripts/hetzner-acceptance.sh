#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
command -v curl >/dev/null || { echo 'curl is required' >&2; exit 2; }
command -v setsid >/dev/null || { echo 'setsid is required' >&2; exit 2; }
temp_dir="$(mktemp -d /tmp/consilium-acceptance.XXXXXX)"
server_pid=''
cleanup(){ if [[ -n "$server_pid" ]]; then kill -TERM -- "-$server_pid" 2>/dev/null || true; for _ in {1..20}; do kill -0 "$server_pid" 2>/dev/null || break; sleep 0.05; done; kill -KILL -- "-$server_pid" 2>/dev/null || true; wait "$server_pid" 2>/dev/null || true; fi; rm -rf -- "$temp_dir"; }
trap cleanup EXIT INT TERM
port="$(node -e "const net=require('node:net'),server=net.createServer();server.unref();server.listen(0,'127.0.0.1',()=>{process.stdout.write(String(server.address().port));server.close()})")"
[[ "$port" =~ ^[0-9]+$ ]] && ((port >= 1024 && port <= 65535)) || { echo 'Failed to allocate an ephemeral loopback port' >&2; exit 2; }
export CONSILIUM_ACCEPTANCE_URL="http://localhost:${port}"
export XDG_CONFIG_HOME="$temp_dir/xdg"
test_secret="acceptance-only-$(od -An -N24 -tx1 /dev/urandom | tr -d ' \n')"
export CONSILIUM_ACCEPTANCE_INSTANCE="acceptance-instance-$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')"
env_file="$temp_dir/acceptance.env"
umask 077
printf 'SESSION_SIGNING_KEY=%s\nACCEPTANCE_INSTANCE_ID=%s\n' "$test_secret" "$CONSILIUM_ACCEPTANCE_INSTANCE" >"$env_file"
safe_log_tail(){ tail -n 120 "$temp_dir/wrangler.log" | sed -e "s/${test_secret}/[REDACTED]/g" -e "s/consilium_session=[^ ;\"]*/consilium_session=[REDACTED]/g" | cut -c1-500 >&2; }
startup_failed(){ grep -Eiq 'EADDRINUSE|address already in use|failed to (start|bind)|listen (EACCES|EPERM)|\[ERROR\]|✘' "$temp_dir/wrangler.log"; }
owned_health(){ curl --silent --fail "$CONSILIUM_ACCEPTANCE_URL/api/health" | node -e "let b='';process.stdin.on('data',c=>b+=c);process.stdin.on('end',()=>{try{const h=JSON.parse(b);process.exit(h.status==='ok'&&h.mode==='fixture'&&h.acceptanceInstance===process.env.CONSILIUM_ACCEPTANCE_INSTANCE?0:1)}catch{process.exit(1)}})"; }

cd "$project_dir"
setsid npx wrangler dev --config wrangler.acceptance.jsonc --local --ip 127.0.0.1 --port "$port" --persist-to "$temp_dir/state" --env-file "$env_file" --show-interactive-dev-session=false --log-level error >"$temp_dir/wrangler.log" 2>&1 &
server_pid=$!
ready=false
for _ in {1..80}; do
  kill -0 "$server_pid" 2>/dev/null || { echo 'Wrangler acceptance child exited before readiness' >&2; safe_log_tail; exit 1; }
  startup_failed && { echo 'Wrangler acceptance child reported a startup/bind failure' >&2; safe_log_tail; exit 1; }
  if owned_health; then ready=true; break; fi
  sleep 0.25
done
$ready || { echo 'Wrangler acceptance child did not establish owned health' >&2; safe_log_tail; exit 1; }
sleep 0.25
kill -0 "$server_pid" 2>/dev/null || { echo 'Wrangler acceptance child exited after health' >&2; safe_log_tail; exit 1; }
startup_failed && { echo 'Wrangler acceptance child reported a startup/bind failure after health' >&2; safe_log_tail; exit 1; }
owned_health || { echo 'Acceptance health ownership became ambiguous' >&2; safe_log_tail; exit 1; }
CI=1 npx wrangler d1 migrations apply consilium-webmcp-acceptance --config wrangler.acceptance.jsonc --local --persist-to "$temp_dir/state"
if ! node scripts/hetzner-http-proof.mjs; then
  echo 'SAFE WRANGLER LOG TAIL (redacted, last 120 lines, 500 columns maximum)' >&2
  safe_log_tail
  exit 1
fi
node scripts/capture-pass9.mjs
