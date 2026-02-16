#!/usr/bin/env sh
set -eu

echo "Starting geometry-spine container"
node /app/rpc/mcp-gateway/http-bridge.js &
PID1=$!

node -e "require('http').createServer((req,res)=>{if(req.url==='/health'){res.statusCode=200;res.end('ok');return;}res.statusCode=404;res.end('nope');}).listen(3031)" &
PID2=$!

echo "MCP HTTP bridge pid=$PID1"
wait $PID1 $PID2
