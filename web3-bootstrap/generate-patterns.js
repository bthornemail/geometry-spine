#!/usr/bin/env node
const http = require('http');

let block = 0;

function json(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    return json(res, { ok: true, service: 'pattern-generator' });
  }

  let body = '';
  req.on('data', (c) => (body += c.toString()));
  req.on('end', () => {
    let payload = {};
    try { payload = JSON.parse(body || '{}'); } catch (_) {}

    const method = payload.method;
    if (method === 'eth_blockNumber') {
      return json(res, { jsonrpc: '2.0', id: payload.id ?? 1, result: '0x' + block.toString(16) });
    }
    if (method === 'fano_nextPattern') {
      const matrix = Array.from({ length: 7 }, (_, i) => (block + i) % 4);
      block += 1;
      return json(res, { jsonrpc: '2.0', id: payload.id ?? 1, result: matrix });
    }

    return json(res, { jsonrpc: '2.0', id: payload.id ?? 1, error: { code: -32601, message: 'method not found' } });
  });
});

server.listen(8545, '0.0.0.0', () => {
  console.log('pattern-generator listening on :8545');
});
