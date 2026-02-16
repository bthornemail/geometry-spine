#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");

let webauthn = null;
try {
  webauthn = require("../../webauthn/webauthn");
} catch (_) {
  webauthn = null;
}

class MCPGateway {
  constructor() {
    this.authorityGate = process.env.AUTHORITY_GATE_PATH || "/root/metaverse/invariants/authority/AuthorityProjection.hs";
    this.strictAuthority = (process.env.AUTHORITY_STRICT || "true").toLowerCase() !== "false";
    this.tools = {
      "platonic-validate": this.runAwk("platonic-validate.awk"),
      "catalan-attest": this.runAwk("catalan-attest.awk"),
      "pfister-embed": this.runAwk("pfister-embed.awk"),
      "arch-negotiate": this.runSed("arch-negotiate.sed"),
      "canonicalize": this.runSed("canonicalize.sed"),
    };
  }

  runAwk(script) {
    const scriptPath = path.join(__dirname, "awk", script);
    return (input) =>
      new Promise((resolve, reject) => {
        const p = spawn("awk", ["-f", scriptPath]);
        let out = "";
        let err = "";
        p.stdout.on("data", (d) => {
          out += d.toString();
        });
        p.stderr.on("data", (d) => {
          err += d.toString();
        });
        p.on("close", (code) => {
          if (code === 0) resolve(out.trim());
          else reject(new Error(`awk(${script}) exited ${code}: ${err.trim()}`));
        });
        p.stdin.end(String(input || ""));
      });
  }

  runSed(script) {
    const scriptPath = path.join(__dirname, "sed", script);
    return (input) =>
      new Promise((resolve, reject) => {
        const p = spawn("sed", ["-f", scriptPath]);
        let out = "";
        let err = "";
        p.stdout.on("data", (d) => {
          out += d.toString();
        });
        p.stderr.on("data", (d) => {
          err += d.toString();
        });
        p.on("close", (code) => {
          if (code === 0) resolve(out.trim());
          else reject(new Error(`sed(${script}) exited ${code}: ${err.trim()}`));
        });
        p.stdin.end(String(input || ""));
      });
  }

  async checkAuthority(identity) {
    if (this.strictAuthority && !fs.existsSync(this.authorityGate)) {
      throw new Error("HALT: Authority gate missing");
    }

    const id = String(identity || "").trim();
    if (!id || id === "unauthorized") {
      throw new Error("HALT: unauthorized identity");
    }

    if (id.startsWith("webauthn:")) {
      if (!webauthn || typeof webauthn.isAuthorizedIdentity !== "function") {
        throw new Error("HALT: WebAuthn module unavailable");
      }
      if (!webauthn.isAuthorizedIdentity(id)) {
        throw new Error("HALT: WebAuthn validation failed");
      }
    }

    return true;
  }

  async handleRequest(req) {
    const { tool, input, identity } = req || {};

    try {
      await this.checkAuthority(identity);
    } catch (e) {
      return { error: "HALT", message: e.message, bytesEmitted: 0 };
    }

    if (!this.tools[tool]) {
      return { error: `Unknown tool: ${tool}`, bytesEmitted: 0 };
    }

    try {
      const output = await this.tools[tool](input || "");
      return {
        output,
        bytesEmitted: Buffer.byteLength(output),
        authorityCheck: "passed",
      };
    } catch (e) {
      return { error: String(e.message || e), bytesEmitted: 0 };
    }
  }
}

const gateway = new MCPGateway();
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let req;
  try {
    req = JSON.parse(trimmed);
  } catch (e) {
    process.stdout.write(
      JSON.stringify({ error: `Invalid JSON: ${e.message}`, bytesEmitted: 0 }) + "\n"
    );
    return;
  }

  const resp = await gateway.handleRequest(req);
  process.stdout.write(JSON.stringify(resp) + "\n");
});
