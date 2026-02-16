#!/usr/bin/env node
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class GeometryBlockchainBridge {
  constructor(config = {}) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl || 'http://127.0.0.1:8545');
    this.chainId = config.chainId || 31337;
    this.wallet = null;
    this.addresses = this.loadAddresses();
  }

  loadAddresses() {
    try {
      const p = path.join(__dirname, '../blockchain/contracts/deployments/addresses.json');
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (_) {
      return {};
    }
  }

  async connect(privateKey) {
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    const address = await this.wallet.getAddress();
    const balance = await this.provider.getBalance(address);
    return { address, balance: ethers.formatEther(balance) };
  }

  computePfister(matrix) {
    return crypto.createHash('sha256').update(matrix.join('')).digest('hex').slice(0, 32);
  }
}

if (require.main === module) {
  const bridge = new GeometryBlockchainBridge();
  const cmd = process.argv[2];
  if (cmd === 'connect') {
    const pk = process.argv[3] || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    bridge.connect(pk).then(console.log).catch(console.error);
  } else {
    console.log('Usage: bridge.js connect [privateKey]');
  }
}
