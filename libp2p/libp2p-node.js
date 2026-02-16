#!/usr/bin/env node
const { createLibp2p } = require("libp2p");
const { tcp } = require("@libp2p/tcp");
const { noise } = require("@chainsafe/libp2p-noise");
const { mplex } = require("@libp2p/mplex");
const { identify } = require("@libp2p/identify");
const { ping } = require("@libp2p/ping");
const { gossipsub } = require("@chainsafe/libp2p-gossipsub");
const { bootstrap } = require("@libp2p/bootstrap");

class Libp2pLightNode {
  constructor(config = {}) {
    this.node = null;
    this.bootstrapPeers = config.bootstrapPeers || [
      "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN"
    ];
  }

  async start() {
    this.node = await createLibp2p({
      addresses: { listen: ["/ip4/0.0.0.0/tcp/0"] },
      transports: [tcp()],
      connectionEncryptors: [noise()],
      streamMuxers: [mplex()],
      services: {
        identify: identify(),
        ping: ping(),
        pubsub: gossipsub({ allowPublishToZeroPeers: true }),
        bootstrap: bootstrap({ list: this.bootstrapPeers })
      }
    });
    await this.node.start();
    console.log("libp2p started", this.node.peerId.toString());
    this.node.getMultiaddrs().forEach((a) => console.log(a.toString()));
  }

  async stop() {
    if (this.node) await this.node.stop();
  }
}

module.exports = Libp2pLightNode;

if (require.main === module) {
  const n = new Libp2pLightNode();
  n.start().catch((e) => { console.error(e); process.exit(1); });
  process.on("SIGINT", async () => { await n.stop(); process.exit(0); });
}
