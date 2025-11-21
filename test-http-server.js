#!/usr/bin/env node
/**
 * Simple HTTP test server
 */

const http = require('http');

const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log(`  Headers:`, JSON.stringify(req.headers, null, 2));

  // Handle different routes
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Noverlink Test Server</title>
</head>
<body>
    <h1>✅ HTTP Proxy Working!</h1>
    <p>This page is served from <code>localhost:3000</code></p>
    <p>Accessed through Noverlink tunnel</p>
    <p>Timestamp: ${timestamp}</p>
    <hr>
    <h2>Test Links:</h2>
    <ul>
        <li><a href="/api/test">GET /api/test</a></li>
        <li><a href="/api/json">GET /api/json</a></li>
        <li><a href="/large">GET /large (1MB response)</a></li>
    </ul>
</body>
</html>
    `);
  }
  else if (req.url === '/api/test') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test endpoint OK');
  }
  else if (req.url === '/api/json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'HTTP proxy working',
      timestamp: timestamp,
      method: req.method,
      url: req.url
    }));
  }
  else if (req.url === '/large') {
    // Send 1MB of data
    const data = 'X'.repeat(1024 * 1024);
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': data.length
    });
    res.end(data);
    console.log(`  → Sent 1MB response`);
  }
  else if (req.url === '/echo' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log(`  POST body:`, body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        echo: body,
        length: body.length,
        timestamp: timestamp
      }));
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`🚀 HTTP test server running on http://localhost:${PORT}`);
  console.log(`📡 Waiting for requests...\n`);
});
