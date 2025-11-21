#!/usr/bin/env python3
"""Simple WebSocket echo server for testing"""

import asyncio
import websockets
import sys

async def echo_handler(websocket):
    """Echo all received messages back to client"""
    client_addr = websocket.remote_address
    print(f"✓ Client connected: {client_addr}")

    try:
        async for message in websocket:
            print(f"← Received: {message}")
            response = f"Echo: {message}"
            await websocket.send(response)
            print(f"→ Sent: {response}")
    except websockets.exceptions.ConnectionClosed:
        print(f"✗ Client disconnected: {client_addr}")
    except Exception as e:
        print(f"✗ Error: {e}")

async def main():
    port = 3000
    print(f"🚀 WebSocket echo server starting on ws://localhost:{port}")
    print(f"📡 Waiting for connections...\n")

    async with websockets.serve(echo_handler, "localhost", port):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped")
        sys.exit(0)
