SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

.PHONY: deps build test verify package docker clean

deps:
	npm install

build: deps
	mkdir -p dist/bin
	cp web3/wallet-adapter.js dist/bin/geometry-spine
	cp rpc/mcp-gateway/mcp-server.js dist/bin/geometry-spine-mcp
	chmod +x dist/bin/geometry-spine*

test:
	bash ./test-p2p.sh

verify:
	./packaging/hardware/hardware-audit.sh

package: build
	mkdir -p dist/release
	tar -czf dist/release/geometry-spine-dev.tar.gz -C dist/bin geometry-spine geometry-spine-mcp
	sha256sum dist/release/geometry-spine-dev.tar.gz > dist/release/geometry-spine-dev.tar.gz.sha256

docker:
	./packaging/docker/build.sh dev

clean:
	rm -rf dist
