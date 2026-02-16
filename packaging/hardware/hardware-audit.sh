#!/usr/bin/env bash
set -euo pipefail

report="hardware-report-$(date +%Y%m%d-%H%M%S).json"
mem=$(free -m | awk '/Mem:/ {print $2}')
disk=$(df -BG / | awk 'NR==2{gsub("G", "", $2); print $2}')
cores=$(nproc)

jq -n \
  --arg ts "$(date -Iseconds)" \
  --arg host "$(hostname)" \
  --argjson mem "$mem" \
  --argjson disk "$disk" \
  --argjson cores "$cores" \
  '{timestamp:$ts,hostname:$host,memory_mb:$mem,disk_gb:$disk,cores:$cores}' > "$report"

cat "$report"
