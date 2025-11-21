const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end('Not found');
});

server.on('upgrade', (req, socket, head) => {
  console.log('✓ WebSocket upgrade request received');

  // WebSocket handshake
  const key = req.headers['sec-websocket-key'];
  const acceptKey = require('crypto')
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '',
    ''
  ].join('\r\n');

  socket.write(responseHeaders);
  console.log('✓ WebSocket handshake complete');

  // Simple frame parser and echo
  socket.on('data', (data) => {
    // WebSocket frame format (simplified for TEXT frames)
    if (data.length < 2) return;

    const firstByte = data[0];
    const secondByte = data[1];
    const isFin = (firstByte & 0x80) !== 0;
    const opcode = firstByte & 0x0F;
    const isMasked = (secondByte & 0x80) !== 0;
    let payloadLength = secondByte & 0x7F;
    let offset = 2;

    if (opcode === 0x8) {
      // Close frame
      console.log('✓ WebSocket close frame received');
      socket.end();
      return;
    }

    if (opcode === 0x9) {
      // Ping frame - send pong
      const pongFrame = Buffer.from([0x8A, 0x00]);
      socket.write(pongFrame);
      return;
    }

    if (opcode !== 0x1 && opcode !== 0x2) {
      // Not a text or binary frame
      return;
    }

    // Handle extended payload length
    if (payloadLength === 126) {
      payloadLength = data.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      payloadLength = Number(data.readBigUInt64BE(offset));
      offset += 8;
    }

    if (!isMasked) {
      console.log('✗ Unmasked frame from client (protocol violation)');
      return;
    }

    // Extract mask and payload
    const mask = data.slice(offset, offset + 4);
    offset += 4;
    const payload = data.slice(offset, offset + payloadLength);

    // Unmask payload
    const unmasked = Buffer.alloc(payloadLength);
    for (let i = 0; i < payloadLength; i++) {
      unmasked[i] = payload[i] ^ mask[i % 4];
    }

    const message = unmasked.toString('utf8');
    console.log(`← Received: ${message}`);

    // Create echo response
    const echoMsg = `Echo: ${message}`;
    const echoBuffer = Buffer.from(echoMsg, 'utf8');

    // Build response frame (unmasked, from server)
    const responseFrame = Buffer.alloc(2 + echoBuffer.length);
    responseFrame[0] = 0x81; // FIN + Text frame
    responseFrame[1] = echoBuffer.length; // Length (no mask)
    echoBuffer.copy(responseFrame, 2);

    socket.write(responseFrame);
    console.log(`→ Sent: ${echoMsg}`);
  });

  socket.on('end', () => {
    console.log('✗ Client disconnected');
  });

  socket.on('error', (err) => {
    console.log(`✗ Socket error: ${err.message}`);
  });
});

const PORT = 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`🚀 WebSocket echo server running on ws://localhost:${PORT}`);
  console.log('📡 Waiting for connections...\n');
});
