#!/bin/bash
# Test script for Relay + CLI tunnel

set -e

echo "=== Noverlink Tunnel Test ==="
echo

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}[Cleanup]${NC} Stopping all processes..."
    pkill -P $$ 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Start a simple HTTP server on localhost:3000
echo -e "${BLUE}[Step 1]${NC} Starting test HTTP server on localhost:3000..."
python3 -m http.server 3000 > /dev/null 2>&1 &
HTTP_PID=$!
sleep 1

if ! kill -0 $HTTP_PID 2>/dev/null; then
    echo -e "${RED}[Error]${NC} Failed to start HTTP server"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} HTTP server running (PID: $HTTP_PID)"
echo

# 2. Start Relay server
echo -e "${BLUE}[Step 2]${NC} Starting Relay server..."
cd packages/relay
WS_PORT=9444 HTTP_PORT=9090 cargo run > /tmp/relay.log 2>&1 &
RELAY_PID=$!
cd ../..
sleep 2

if ! kill -0 $RELAY_PID 2>/dev/null; then
    echo -e "${RED}[Error]${NC} Failed to start Relay"
    cat /tmp/relay.log
    cleanup
fi
echo -e "${GREEN}[OK]${NC} Relay server running (PID: $RELAY_PID)"
echo

# 3. Start CLI tunnel
echo -e "${BLUE}[Step 3]${NC} Starting CLI tunnel..."
cd packages/cli
cargo run -- http --port 3000 > /tmp/cli.log 2>&1 &
CLI_PID=$!
cd ../..
sleep 3

if ! kill -0 $CLI_PID 2>/dev/null; then
    echo -e "${RED}[Error]${NC} Failed to start CLI"
    cat /tmp/cli.log
    cleanup
fi
echo -e "${GREEN}[OK]${NC} CLI tunnel running (PID: $CLI_PID)"
echo

# 4. Extract tunnel URL from CLI logs
echo -e "${BLUE}[Step 4]${NC} Getting tunnel URL..."
sleep 1
TUNNEL_URL=$(grep -oP "http://[a-z0-9]+" /tmp/cli.log | head -1 || echo "")

if [ -z "$TUNNEL_URL" ]; then
    echo -e "${RED}[Error]${NC} Could not find tunnel URL in CLI logs"
    echo "CLI logs:"
    cat /tmp/cli.log
    cleanup
fi
echo -e "${GREEN}[OK]${NC} Tunnel URL: ${TUNNEL_URL}"
echo

# 5. Test HTTP request through tunnel
echo -e "${BLUE}[Step 5]${NC} Testing HTTP request through tunnel..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: ${TUNNEL_URL#http://}" http://localhost:9090/ || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}[SUCCESS]${NC} Tunnel is working! HTTP 200 received"
else
    echo -e "${RED}[FAIL]${NC} Got HTTP $HTTP_CODE"
    echo "Relay logs:"
    tail -20 /tmp/relay.log
    echo "CLI logs:"
    tail -20 /tmp/cli.log
fi
echo

echo "Press Ctrl+C to stop all services..."
wait
