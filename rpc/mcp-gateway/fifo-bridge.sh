#!/usr/bin/env bash
set -euo pipefail

FIFO_DIR="/tmp/mcp-fifo"
MCP_CMD=(node /root/geometry-spine/rpc/mcp-gateway/mcp-server.js)
TOOLS=(platonic-validate catalan-attest pfister-embed arch-negotiate canonicalize)

mkdir -p "$FIFO_DIR"

for tool in "${TOOLS[@]}"; do
  fifo="$FIFO_DIR/$tool"
  rm -f "$fifo"
  mkfifo "$fifo"

  (
    while true; do
      if IFS= read -r line < "$fifo"; then
        req=$(jq -cn --arg tool "$tool" --arg input "$line" --arg identity "fifo-client" '{tool:$tool,input:$input,identity:$identity}')
        resp=$(printf '%s\n' "$req" | "${MCP_CMD[@]}" | head -n1 || true)
        printf '%s [%s] %s -> %s\n' "$(date -Is)" "$tool" "$line" "$resp" >> "$FIFO_DIR/$tool.log"
      fi
    done
  ) &

done

echo "FIFO bridges active in $FIFO_DIR"
wait
