#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class CrossAuditBridge {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      lightGardenByMetaverse: {},
      metaverseByLightGarden: {},
      mergePoints: [],
      recommendations: []
    };
  }

  fileExists(p) { return fs.existsSync(p); }

  run() {
    console.log("Cross-Audit: Light Garden <-> Metaverse");
    console.log("======================================\n");
    this.auditLightGardenByMetaverse();
    this.auditMetaverseByLightGarden();
    this.identifyMergePoints();
    this.generateRecommendations();
    this.saveReport();
    console.log("\nCross-audit complete!");
    console.log(`Report: ${path.join(__dirname, "../reports/cross-audit.json")}`);
  }

  auditLightGardenByMetaverse() {
    const base = "/root/light-garden";
    const checks = {
      authorityGate: this.checkAuthorityGate(base),
      deterministicReplay: this.checkDeterministicReplay(base),
      posixTransport: this.checkPosixTransport(base),
      projectionDisposable: this.checkProjectionDisposable(base),
      strictMode: this.checkStrictMode(base)
    };
    const vals = Object.values(checks);
    checks.score = vals.filter(v => v.passed).length;
    checks.total = vals.length;
    this.results.lightGardenByMetaverse = checks;
    console.log(`Light Garden by Metaverse: ${checks.score}/${checks.total}`);
  }

  auditMetaverseByLightGarden() {
    const base = "/root/metaverse";
    const checks = {
      fanoEncoding: this.checkFanoEncoding(base),
      wordNetIntegration: this.checkWordNetIntegration(base),
      ndjsonTraces: this.checkNdjsonTraces(base),
      ledArrays: this.checkLedArrays(base),
      featureAudit: this.checkFeatureAudit(base)
    };
    const vals = Object.values(checks);
    checks.score = vals.filter(v => v.passed).length;
    checks.total = vals.length;
    this.results.metaverseByLightGarden = checks;
    console.log(`Metaverse by Light Garden: ${checks.score}/${checks.total}`);
  }

  checkAuthorityGate(base) {
    const hasInvariantGate = this.fileExists(`${base}/invariants/authority`);
    const hasRuntimeGate = this.fileExists(`${base}/authority`) || this.fileExists(`${base}/runtime/authority`);
    return {
      passed: hasInvariantGate || hasRuntimeGate,
      note: hasInvariantGate ? "Authority invariant present" : "No explicit authority gate directory"
    };
  }

  checkDeterministicReplay(base) {
    const hasGolden = this.fileExists(`${base}/audit/artifacts/golden`) || this.fileExists(`${base}/golden`);
    const hasTraces = this.fileExists(`${base}/interplanetary-demo/ndjson`) || this.fileExists(`${base}/runtime/replay`);
    return { passed: hasGolden && hasTraces, note: `golden=${hasGolden} traces=${hasTraces}` };
  }

  checkPosixTransport(base) {
    const hasCserver = this.fileExists(`${base}/c-server/fano_server.c`);
    const hasWebsocket = this.fileExists(`${base}/c-server/websocket.c`);
    const hasBus = this.fileExists(`${base}/pipelines/posix-bus`) || this.fileExists(`${base}/runtime/sync-transport`);
    return { passed: (hasCserver && hasWebsocket) || hasBus, note: `cserver=${hasCserver} websocket=${hasWebsocket} bus=${hasBus}` };
  }

  checkProjectionDisposable(base) {
    const hasProjection = this.fileExists(`${base}/projections`) || this.fileExists(`${base}/interplanetary-demo/render`);
    const hasArtifacts = this.fileExists(`${base}/audit/artifacts`);
    return { passed: hasProjection || hasArtifacts, note: `projection=${hasProjection} artifacts=${hasArtifacts}` };
  }

  checkStrictMode(base) {
    let scripts = [];
    try {
      scripts = execSync(`find ${base} -type f -name "*.sh" | head -n 30`, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
    } catch (_) { scripts = []; }
    if (scripts.length === 0) return { passed: false, note: "No shell scripts found" };
    let strict = 0;
    for (const s of scripts) {
      try {
        const c = fs.readFileSync(s, "utf8");
        if (c.includes("set -euo pipefail")) strict++;
      } catch (_) {}
    }
    return { passed: strict === scripts.length, note: `${strict}/${scripts.length} scripts use strict mode` };
  }

  checkFanoEncoding(base) {
    const hasWorldIr = this.fileExists(`${base}/world-ir/compiler/ir.md`) || this.fileExists(`${base}/world-ir/compiler`);
    return { passed: hasWorldIr, note: hasWorldIr ? "world-ir compiler present" : "no world-ir compiler" };
  }

  checkWordNetIntegration(base) {
    const hasWordNet = this.fileExists(`/root/light-garden/wordnet/server.js`);
    const hasNative = this.fileExists(`${base}/wordnet`) || this.fileExists(`${base}/runtime/semantic`);
    return { passed: hasWordNet || hasNative, note: hasNative ? "native semantic capability" : "external wordnet available" };
  }

  checkNdjsonTraces(base) {
    let count = 0;
    try { count = Number(execSync(`find ${base} -type f -name "*.ndjson" | wc -l`, { encoding: "utf8" }).trim()); }
    catch (_) { count = 0; }
    return { passed: count > 0, note: `Found ${count} NDJSON files` };
  }

  checkLedArrays(base) {
    const hasFirmware = this.fileExists(`/root/light-garden/firmware`) || this.fileExists(`${base}/firmware`);
    return { passed: hasFirmware, note: hasFirmware ? "firmware layer available" : "no firmware" };
  }

  checkFeatureAudit(base) {
    const hasAudit = this.fileExists(`/root/light-garden/audit/scripts/run-feature-audit.js`) || this.fileExists(`${base}/audit`);
    return { passed: hasAudit, note: hasAudit ? "feature audit available" : "feature audit missing" };
  }

  identifyMergePoints() {
    this.results.mergePoints = [
      { name: "authority-gate", source: "metaverse/invariants/authority", target: "geometry-spine/authority", priority: "high" },
      { name: "trace-format", source: "light-garden/audit/traces", target: "geometry-spine/trace", priority: "high" },
      { name: "rpc-bridge", source: "both", target: "geometry-spine/rpc/mcp-gateway", priority: "high" },
      { name: "geometry-pfister", source: "light-garden+metaverse", target: "geometry-spine/geometry/pfister-128", priority: "medium" },
      { name: "cross-validation", source: "both", target: "geometry-spine/validation/cross-audit", priority: "medium" }
    ];
  }

  generateRecommendations() {
    this.results.recommendations = [
      { for: "light-garden", action: "Wrap external-facing mutating services with authority gate", priority: "high" },
      { for: "light-garden", action: "Raise shell strict-mode coverage", priority: "medium" },
      { for: "metaverse", action: "Add semantic WordNet integration adapter", priority: "high" },
      { for: "metaverse", action: "Adopt NDJSON traces for audit/replay", priority: "high" },
      { for: "geometry-spine", action: "Implement MCP gateway AWK/SED validators with authority check", priority: "high" }
    ];
  }

  saveReport() {
    const out = path.join(__dirname, "../reports/cross-audit.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(this.results, null, 2));
  }
}

new CrossAuditBridge().run();
