# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm install --omit=dev
COPY web3/ ./web3/
COPY ipfs/ ./ipfs/
COPY libp2p/ ./libp2p/
COPY webauthn/ ./webauthn/
COPY rpc/ ./rpc/
COPY packaging/ ./packaging/
COPY test-p2p.sh ./test-p2p.sh
COPY README.md ./README.md

FROM node:18-alpine
RUN apk add --no-cache bash curl jq ca-certificates gettext
WORKDIR /app
COPY --from=builder /build /app
COPY packaging/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3030 3031
ENTRYPOINT ["/entrypoint.sh"]
