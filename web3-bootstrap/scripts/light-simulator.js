#!/usr/bin/env node
const http = require('http');

function send() {
  const matrix = Array.from({ length: 7 }, () => Math.floor(Math.random() * 4));
  const payload = JSON.stringify({ input: matrix.join(' '), identity: 'stream' });

  const req = http.request(
    {
      hostname: 'stream-gateway',
      port: 3030,
      path: '/platonic-validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 3000,
    },
    (res) => {
      let data = '';
      res.on('data', (c) => (data += c.toString()));
      res.on('end', () => {
        console.log('matrix=', JSON.stringify(matrix), 'status=', res.statusCode, 'resp=', data.slice(0, 120));
      });
    }
  );

  req.on('error', (err) => console.log('send-error', err.message));
  req.write(payload);
  req.end();
}

setInterval(send, 1000);
send();
