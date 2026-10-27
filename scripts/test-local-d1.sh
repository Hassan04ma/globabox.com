#!/usr/bin/env bash
set -euo pipefail
mkdir -p .tmp/globabox-test-d1
PORT=8798
PERSIST=".tmp/globabox-test-d1"
npx wrangler d1 migrations apply DB --config wrangler.staging.jsonc --local --persist-to "$PERSIST"
npx wrangler dev --config wrangler.staging.jsonc --local --ip 127.0.0.1 --port "$PORT" --persist-to "$PERSIST" --var ADMIN_USERNAME:ci_test_admin --var ADMIN_PASSWORD:CI_Only_Not_A_Real_Password_2026 --var ADMIN_SESSION_SECRET:ci_test_secret_not_for_production_2026_abcdefghijklmnopqrstuvwxyz > .tmp/globabox-worker-test.log 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT
ready=0
for i in $(seq 1 45); do
  if curl --silent --fail "http://127.0.0.1:$PORT/api/products" >/dev/null; then ready=1; break; fi
  if ! kill -0 "$PID" 2>/dev/null; then cat .tmp/globabox-worker-test.log; exit 1; fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then cat .tmp/globabox-worker-test.log; exit 1; fi
GB_TEST_BASE_URL="http://127.0.0.1:$PORT" npx tsx tests/localD1.http.test.ts
