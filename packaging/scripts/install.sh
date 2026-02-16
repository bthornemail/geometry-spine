#!/usr/bin/env bash
set -euo pipefail

echo "Geometry Spine installer"
INSTALL_DIR=${INSTALL_DIR:-/usr/local/bin}
sudo mkdir -p "$INSTALL_DIR"
echo "Copy release binaries into $INSTALL_DIR (manual step)."
