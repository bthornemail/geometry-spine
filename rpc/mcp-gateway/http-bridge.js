#!/usr/bin/env node
const http = require('http');
const { spawn } = require('child_process');

const path = require("path");
const MCP_SERVER = path.join(__dirname, "mcp-server.js");
const PORT = Number(process.env.PORT || 3030);

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function callMcp(payload) {
  return new Promise((resolve) => {
    const mcp = spawn('node', [MCP_SERVER]);
    let out = '';
    let err = '';

    mcp.stdout.on('data', (d) => { out += d.toString(); });
    mcp.stderr.on('data', (d) => { err += d.toString(); });
    mcp.on('close', (code) => {
      if (code !== 0) {
        resolve({ status: 500, body: { error: `mcp exited ${code}`, detail: err.trim() } });
        return;
      }
      const first = out.split('\n').find(Boolean) || '';
      try {
        resolve({ status: 200, body: JSON.parse(first) });
      } catch (e) {
        resolve({ status: 500, body: { error: 'Invalid MCP response', raw: first, detail: e.message } });
      }
    });

    mcp.stdin.write(JSON.stringify(payload) + '\n');
    mcp.stdin.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const tool = (req.url || '/').replace(/^\//, '').trim();
  if (!tool) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing tool in path' }));
    return;
  }

  try {
    const bodyRaw = await readBody(req);
    let parsed;
    try { parsed = bodyRaw ? JSON.parse(bodyRaw) : {}; }
    catch (_) { parsed = { input: bodyRaw }; }

    const payload = {
      tool,
      input: String(parsed.input ?? ''),
      identity: String(parsed.identity ?? 'http-client')
    };

    const result = await callMcp(payload);
    res.writeHead(result.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message || String(e) }));
  }
});

server.listen(PORT, () => {
  console.log(`MCP HTTP bridge listening on ${PORT}`);
});
