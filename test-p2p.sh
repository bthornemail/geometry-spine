#!/usr/bin/env bash
set -euo pipefail

echo "P2P Integration Test"

echo "[1] TURN/STUN"
nc -zv 127.0.0.1 3478 </dev/null 2>&1 | tail -n1
nc -zv 127.0.0.1 5349 </dev/null 2>&1 | tail -n1

echo "[2] MCP + WebAuthn allow"
curl -s -X POST http://127.0.0.1:3030/platonic-validate   -H "Content-Type: application/json"   -d '{"input":"0 2 1 2 2 0 2","identity":"webauthn:test-user"}'   | jq -c '. | {authorityCheck: .authorityCheck, error: .error, message: .message}'

echo "[3] MCP unauthorized block"
curl -s -X POST http://127.0.0.1:3030/platonic-validate   -H "Content-Type: application/json"   -d '{"input":"0 2 1 2 2 0 2","identity":"unauthorized"}'   | jq -c '. | {authorityCheck: .authorityCheck, error: .error, message: .message}'

echo "[4] Light Garden WordNet"
curl -s "http://127.0.0.1:4096/api/wordnet/lookup?word=wisdom"   | jq -r 'if type=="array" then .[0].lemma else .lemma end'

echo "[5] Metaverse lattice peer file"
if [ -f /root/metaverse/runtime/lattice/peers/state/peer.json ]; then
  jq -r '.id' /root/metaverse/runtime/lattice/peers/state/peer.json
else
  echo "missing"
fi
