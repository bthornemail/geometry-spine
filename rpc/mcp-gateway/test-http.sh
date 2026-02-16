#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

node http-bridge.js >/tmp/http-bridge.log 2>&1 &
HTTP_PID=$!
cleanup() {
  kill "$HTTP_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT
sleep 1

echo "Test 1: /platonic-validate"
curl -sS -X POST http://127.0.0.1:3030/platonic-validate \
  -H "Content-Type: application/json" \
  -d '{"input":"0 2 1 2 2 0 2","identity":"test"}' | jq '.'

echo "Test 2: /catalan-attest"
curl -sS -X POST http://127.0.0.1:3030/catalan-attest \
  -H "Content-Type: application/json" \
  -d '{"input":"truncate 0 2 1 2 2 0 2","identity":"test"}' | jq '.'

echo "Test 3: /pfister-embed"
curl -sS -X POST http://127.0.0.1:3030/pfister-embed \
  -H "Content-Type: application/json" \
  -d '{"input":"0 2 1 2 2 0 2 snub_L accept","identity":"test"}' | jq '.'

echo "Test 4: unauthorized HALT"
curl -sS -X POST http://127.0.0.1:3030/platonic-validate \
  -H "Content-Type: application/json" \
  -d '{"input":"0 2 1 2 2 0 2","identity":"unauthorized"}' | jq '.'

echo "HTTP bridge tests complete"
