#!/bin/bash
set -e

echo "🧪 WebSocket Proxy Test Suite"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if websockets package is installed
if ! python3 -c "import websockets" 2>/dev/null; then
    echo -e "${YELLOW}Installing websockets package...${NC}"
    python3 -m pip install websockets --quiet
fi

# Check if websocat is installed
if ! command -v websocat &> /dev/null; then
    echo -e "${YELLOW}websocat not found. Installing...${NC}"
    cargo install websocat --quiet
fi

echo -e "${GREEN}✓ Dependencies ready${NC}"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "Cleaning up..."
    pkill -f "test-ws-server.py" 2>/dev/null || true
    pkill -f "relay" 2>/dev/null || true
    pkill -f "noverlink-cli" 2>/dev/null || true
    sleep 1
}

trap cleanup EXIT

# Start WebSocket echo server
echo "1. Starting WebSocket echo server on localhost:3000"
python3 test-ws-server.py > /tmp/ws-server.log 2>&1 &
WS_SERVER_PID=$!
sleep 2

if ! ps -p $WS_SERVER_PID > /dev/null; then
    echo -e "${RED}✗ Failed to start WebSocket server${NC}"
    cat /tmp/ws-server.log
    exit 1
fi
echo -e "${GREEN}✓ WebSocket server running (PID: $WS_SERVER_PID)${NC}"
echo ""

# Build and start Relay
echo "2. Building and starting Relay on ports 8080 (WS) and 9080 (HTTP)"
cd packages/relay
cargo build --quiet 2>&1 | grep -v "Compiling\|Finished" || true
WS_PORT=8080 HTTP_PORT=9080 BASE_DOMAIN=localhost cargo run --quiet > /tmp/relay.log 2>&1 &
RELAY_PID=$!
cd ../..
sleep 3

if ! ps -p $RELAY_PID > /dev/null; then
    echo -e "${RED}✗ Failed to start Relay${NC}"
    cat /tmp/relay.log
    exit 1
fi
echo -e "${GREEN}✓ Relay running (PID: $RELAY_PID)${NC}"
echo ""

# Build and start CLI
echo "3. Building and starting CLI"
cd packages/cli
cargo build --quiet 2>&1 | grep -v "Compiling\|Finished" || true
cargo run --quiet -- start --relay ws://localhost:8080 --port 3000 > /tmp/cli.log 2>&1 &
CLI_PID=$!
cd ../..
sleep 3

if ! ps -p $CLI_PID > /dev/null; then
    echo -e "${RED}✗ Failed to start CLI${NC}"
    cat /tmp/cli.log
    exit 1
fi

# Extract subdomain from CLI logs
SUBDOMAIN=$(grep -oP 'Tunnel registered: http://\K[^.]+' /tmp/cli.log | head -1)
if [ -z "$SUBDOMAIN" ]; then
    echo -e "${RED}✗ Could not find subdomain in CLI logs${NC}"
    echo "CLI log:"
    cat /tmp/cli.log
    exit 1
fi

echo -e "${GREEN}✓ CLI running (PID: $CLI_PID)${NC}"
echo -e "${GREEN}✓ Tunnel URL: ws://${SUBDOMAIN}.localhost:9080${NC}"
echo ""

# Test WebSocket connection
echo "4. Testing WebSocket connection"
echo "   Connecting to ws://${SUBDOMAIN}.localhost:9080"
echo ""

# Test 1: Send and receive message
echo "Test 1: Echo test"
RESULT=$(echo "Hello WebSocket" | timeout 5 websocat "ws://${SUBDOMAIN}.localhost:9080" 2>&1 || true)

if echo "$RESULT" | grep -q "Echo: Hello WebSocket"; then
    echo -e "${GREEN}✓ Test 1 PASSED: Received correct echo${NC}"
    echo "  Sent: Hello WebSocket"
    echo "  Received: $RESULT"
else
    echo -e "${RED}✗ Test 1 FAILED${NC}"
    echo "  Expected: Echo: Hello WebSocket"
    echo "  Got: $RESULT"
    echo ""
    echo "=== Relay Log ==="
    tail -20 /tmp/relay.log
    echo ""
    echo "=== CLI Log ==="
    tail -20 /tmp/cli.log
    echo ""
    echo "=== WS Server Log ==="
    tail -20 /tmp/ws-server.log
    exit 1
fi
echo ""

# Test 2: Multiple messages
echo "Test 2: Multiple messages"
TEST_PASSED=true
for i in {1..3}; do
    MSG="Message $i"
    RESULT=$(echo "$MSG" | timeout 5 websocat "ws://${SUBDOMAIN}.localhost:9080" 2>&1 || true)

    if echo "$RESULT" | grep -q "Echo: $MSG"; then
        echo -e "${GREEN}✓ Message $i: OK${NC}"
    else
        echo -e "${RED}✗ Message $i: FAILED${NC}"
        TEST_PASSED=false
    fi
done

if [ "$TEST_PASSED" = true ]; then
    echo -e "${GREEN}✓ Test 2 PASSED: All messages echoed correctly${NC}"
else
    echo -e "${RED}✗ Test 2 FAILED${NC}"
    exit 1
fi
echo ""

# Show logs summary
echo "=== Test Summary ==="
echo -e "${GREEN}✓ All tests PASSED!${NC}"
echo ""
echo "Connection chain verified:"
echo "  Browser/Client → Relay (ws://${SUBDOMAIN}.localhost:9080)"
echo "  Relay → CLI (ws://localhost:8080)"
echo "  CLI → localhost WebSocket (ws://localhost:3000)"
echo "  ← Echo back through same chain"
echo ""

# Show interesting log entries
echo "=== Key Log Entries ==="
echo ""
echo "Relay detected WebSocket upgrade:"
grep "WebSocket upgrade" /tmp/relay.log | tail -3 || echo "  (none)"
echo ""
echo "CLI handled WebSocket connection:"
grep "WebSocket" /tmp/cli.log | tail -5 || echo "  (none)"
echo ""
echo "WS Server received messages:"
grep "Received:" /tmp/ws-server.log | tail -5 || echo "  (none)"
echo ""

echo -e "${GREEN}🎉 WebSocket proxy implementation verified!${NC}"
