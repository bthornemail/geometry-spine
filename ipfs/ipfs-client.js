#!/usr/bin/env node
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

class IPFSLightClient {
  constructor(config = {}) {
    this.gateway = config.gateway || "https://ipfs.io/ipfs/";
    this.apiUrl = config.apiUrl || "http://localhost:5001/api/v0";
    this.pinataJWT = config.pinataJWT || process.env.PINATA_JWT;
  }

  async add(content) {
    try {
      return await this.addLocal(content);
    } catch (_) {
      if (this.pinataJWT) return this.addToPinata(content);
      throw new Error("No IPFS endpoint available");
    }
  }

  async addLocal(content) {
    const form = new FormData();
    if (typeof content === "string" && fs.existsSync(content)) form.append("file", fs.createReadStream(content));
    else form.append("file", Buffer.from(String(content)), { filename: "data.txt" });
    const res = await axios.post(this.apiUrl + "/add", form, { headers: form.getHeaders(), timeout: 15000 });
    return { cid: res.data.Hash, size: res.data.Size, provider: "local" };
  }

  async addToPinata(content) {
    const form = new FormData();
    if (typeof content === "string" && fs.existsSync(content)) form.append("file", fs.createReadStream(content));
    else form.append("file", Buffer.from(String(content)), { filename: "data.txt" });
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
      headers: Object.assign({}, form.getHeaders(), { Authorization: "Bearer " + this.pinataJWT }),
      timeout: 30000
    });
    return { cid: res.data.IpfsHash, size: res.data.PinSize, provider: "pinata" };
  }

  async get(cid) {
    const res = await axios.get(this.gateway + cid, { responseType: "arraybuffer", timeout: 15000 });
    return res.data;
  }

  inspectCID(cid) {
    return {
      cid,
      version: cid.startsWith("Qm") ? "v0" : "v1",
      codec: cid.startsWith("Qm") ? "dag-pb" : "unknown",
      multihash: cid.slice(0, 10) + "...",
      path: null
    };
  }
}

module.exports = IPFSLightClient;

if (require.main === module) {
  const c = new IPFSLightClient();
  const cmd = process.argv[2];
  const arg = process.argv[3];
  if (cmd === "inspect" && arg) console.log(JSON.stringify(c.inspectCID(arg), null, 2));
  else console.log("Usage: node ipfs-client.js inspect <cid>");
}
