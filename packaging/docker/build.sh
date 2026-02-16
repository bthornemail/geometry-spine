#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
VERSION=${1:-dev}
IMAGE="geometry-spine:${VERSION}"
docker build -t "$IMAGE" -f packaging/docker/Dockerfile .
echo "$IMAGE"
