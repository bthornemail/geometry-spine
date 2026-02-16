#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "Testing MCP Gateway"
echo "==================="

echo

echo "Test 1: Platonic Validation"
echo '{"tool":"platonic-validate","input":"0 2 1 2 2 0 2","identity":"test"}' | node mcp-server.js | jq '.'

echo

echo "Test 2: Catalan Attestation"
echo '{"tool":"catalan-attest","input":"truncate 0 2 1 2 2 0 2","identity":"test"}' | node mcp-server.js | jq '.'

echo

echo "Test 3: Pfister-128 Embedding"
echo '{"tool":"pfister-embed","input":"0 2 1 2 2 0 2 snub_L accept","identity":"test"}' | node mcp-server.js | jq '.'

echo

echo "Test 4: Authority HALT"
echo '{"tool":"platonic-validate","input":"0 2 1 2 2 0 2","identity":"unauthorized"}' | node mcp-server.js | jq '.'

echo

echo "Done"
