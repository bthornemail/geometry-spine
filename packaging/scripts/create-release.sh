#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
VERSION=${1:-dev}
./packaging/hardware/hardware-audit.sh
make -f packaging/make/Makefile clean build package
mkdir -p packaging/dist/release-${VERSION}
cp -f dist/release/* packaging/dist/release-${VERSION}/
cp -f packaging/k8s/*.yaml packaging/dist/release-${VERSION}/
cp -f packaging/scripts/install.sh packaging/dist/release-${VERSION}/
echo "release at packaging/dist/release-${VERSION}"
