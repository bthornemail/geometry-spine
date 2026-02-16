#!/usr/bin/env bash
set -euo pipefail

echo 'Offline Web3 Metaverse Bootstrap'

for cmd in docker git node npm; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "missing: $cmd"; exit 1; }
done

INSTALL_DIR=${INSTALL_DIR:-$HOME/.geometry-spine/web3}
mkdir -p "$INSTALL_DIR"
cp -r . "$INSTALL_DIR"/

echo 'Install directory:' "$INSTALL_DIR"
echo 'Start stack:'
echo "docker compose -f $INSTALL_DIR/web3-bootstrap/docker-compose.yml up -d"
