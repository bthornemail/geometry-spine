#!/usr/bin/env bash
set -euo pipefail

MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
DISK_GB=$(df -BG / | awk 'NR==2{gsub("G", "", $4); print $4}')

echo "Memory MB: $MEM_MB"
echo "Free disk GB: $DISK_GB"

# tuned for 1GB RAM / 10GB disk VPS
if [ "$MEM_MB" -lt 768 ]; then
  echo "FAIL: need >=768MB RAM"
  exit 1
fi

if [ "$DISK_GB" -lt 5 ]; then
  echo "FAIL: need >=5GB free disk"
  exit 1
fi

echo "PASS"
