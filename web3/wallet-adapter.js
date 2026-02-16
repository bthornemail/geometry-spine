#!/usr/bin/env node
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class Web3WalletAdapter {
  constructor(config = {}) {
    this.provider = null;
    this.signer = null;
    this.chainId = config.chainId || 1;
    this.rpcUrl = config.rpcUrl || "https://rpc.ankr.com/eth";
    this.authorizedUsers = this.loadAuthorizedUsers();
  }

  loadAuthorizedUsers() {
    try {
      const p = path.join(__dirname, "authorized-users.json");
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch (_) {}
    return {};
  }

  async connectPrivateKey(privateKey) {
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    return { address: await this.signer.getAddress(), chainId: this.chainId, walletType: "privatekey" };
  }

  async getPfisterIdentity() {
    if (!this.signer) throw new Error("No wallet connected");
    const address = await this.signer.getAddress();
    const signature = await this.signer.signMessage("Geometry Spine Identity: " + address);
    const pfister128 = crypto.createHash("sha256").update(address + signature).digest("hex").slice(0, 32);
    return { address, pfister128, signature };
  }

  async validateForMCP(identity) {
    if (!identity || !identity.startsWith("web3:")) return { valid: false, reason: "Not a web3 identity" };
    const address = identity.slice(5);
    if (this.authorizedUsers[address]) return { valid: true, user: this.authorizedUsers[address] };
    if (ethers.isAddress(address)) return { valid: true, user: { address, role: "unknown" } };
    return { valid: false, reason: "Unauthorized address" };
  }
}

module.exports = Web3WalletAdapter;

if (require.main === module) {
  const adapter = new Web3WalletAdapter();
  if (process.argv[2] === "validate" && process.argv[3]) {
    adapter.validateForMCP(process.argv[3]).then((r) => console.log(JSON.stringify(r, null, 2)));
  }
}
