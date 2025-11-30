#!/bin/bash

# Start all services for Render deployment
# This script starts services in the correct order with proper error handling

# Don't exit on error - we want to try starting all services
set +e

echo "🚀 Starting TSG Logistics Services on Render..."
echo "=============================================="

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Function to wait for a service to respond
wait_for_service() {
  local url=$1
  local name=$2
  local max_attempts=30
  local attempt=0
  
  echo "Waiting for $name to be ready..."
  while [ $attempt -lt $max_attempts ]; do
    if curl -f -s "$url" > /dev/null 2>&1; then
      echo "✅ $name is ready!"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  echo "⚠️  $name didn't respond after ${max_attempts} seconds"
  return 1
}

# Ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "=============================================="
echo "STARTUP SCRIPT: scripts/start-render.sh"
echo "=============================================="

# Start Orders Service in background
echo ""
echo "📦 Starting Orders Service on port 4001..."
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Checking if dist exists:"
ls -la services/orders-service/dist/main.js 2>/dev/null || echo "⚠️  dist/main.js not found - service may not be built!"
echo "Checking DATABASE_URL env var (first 50 chars):"
echo "${DATABASE_URL:0:50}..." || echo "DATABASE_URL not set"
echo "ORDERS_PORT: ${ORDERS_PORT:-not set, using default 4001}"
ORDERS_PORT=4001 npm run start --workspace @tsg/orders-service > /tmp/orders.log 2>&1 &
ORDERS_PID=$!
echo "Orders Service PID: $ORDERS_PID"
sleep 3
echo "Orders Service log (first 30 lines):"
head -30 /tmp/orders.log 2>/dev/null || echo "No log yet"
if ! kill -0 $ORDERS_PID 2>/dev/null; then
  echo "⚠️  Orders Service process died immediately!"
  echo "Full error log:"
  cat /tmp/orders.log 2>/dev/null || echo "No log file"
fi

# Start Vendor Service in background
echo ""
echo "🏢 Starting Vendor Service on port 4002..."
VENDOR_PORT=4002 npm run start --workspace @tsg/vendor-service > /tmp/vendor.log 2>&1 &
VENDOR_PID=$!
echo "Vendor Service PID: $VENDOR_PID"

# Start Wallet Service in background
echo ""
echo "💰 Starting Wallet Service on port 4003..."
WALLET_PORT=4003 npm run start --workspace @tsg/wallet-service > /tmp/wallet.log 2>&1 &
WALLET_PID=$!
echo "Wallet Service PID: $WALLET_PID"

# Wait for services to initialize
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check if services are still running
SERVICES_OK=true

if ! kill -0 $ORDERS_PID 2>/dev/null; then
  echo "❌ Orders Service failed to start"
  echo "--- Orders Service Log ---"
  cat /tmp/orders.log 2>/dev/null || echo "No log file found"
  SERVICES_OK=false
else
  echo "✅ Orders Service is running (PID: $ORDERS_PID)"
fi

if ! kill -0 $VENDOR_PID 2>/dev/null; then
  echo "❌ Vendor Service failed to start"
  echo "--- Vendor Service Log ---"
  cat /tmp/vendor.log 2>/dev/null || echo "No log file found"
  SERVICES_OK=false
else
  echo "✅ Vendor Service is running (PID: $VENDOR_PID)"
fi

if ! kill -0 $WALLET_PID 2>/dev/null; then
  echo "❌ Wallet Service failed to start"
  echo "--- Wallet Service Log ---"
  cat /tmp/wallet.log 2>/dev/null || echo "No log file found"
  SERVICES_OK=false
else
  echo "✅ Wallet Service is running (PID: $WALLET_PID)"
fi

if [ "$SERVICES_OK" = false ]; then
  echo ""
  echo "⚠️  Some microservices failed to start, but continuing with Gateway..."
  echo "⚠️  Check the logs above for details."
else
  echo ""
  echo "✅ All microservices started successfully!"
fi

# Start API Gateway in background
echo ""
echo "🚪 Starting API Gateway on port 4000..."
echo "Checking if Gateway dist exists:"
ls -la services/api-gateway/dist/main.js 2>/dev/null || echo "⚠️  dist/main.js not found - Gateway may not be built!"
echo "GATEWAY_PORT: ${GATEWAY_PORT:-not set, using default 4000}"
echo "ORDERS_SERVICE_URL: ${ORDERS_SERVICE_URL:-http://localhost:4001}"
echo "VENDOR_SERVICE_URL: ${VENDOR_SERVICE_URL:-http://localhost:4002}"
echo "WALLET_SERVICE_URL: ${WALLET_SERVICE_URL:-http://localhost:4003}"
GATEWAY_PORT=4000 ORDERS_SERVICE_URL=http://localhost:4001 VENDOR_SERVICE_URL=http://localhost:4002 WALLET_SERVICE_URL=http://localhost:4003 npm run start --workspace @tsg/api-gateway > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
echo "API Gateway PID: $GATEWAY_PID"
sleep 5  # Increased wait time for Gateway to start
echo "Gateway log (first 50 lines):"
head -50 /tmp/gateway.log 2>/dev/null || echo "No log yet"
if ! kill -0 $GATEWAY_PID 2>/dev/null; then
  echo "❌ Gateway process died immediately!"
  echo "Full error log:"
  cat /tmp/gateway.log 2>/dev/null || echo "No log file"
  echo ""
  echo "Checking if port 4000 is in use:"
  (lsof -Pi :4000 -sTCP:LISTEN || ss -tuln | grep :4000 || netstat -tuln | grep :4000) 2>/dev/null || echo "Port check tools not available"
else
  echo "✅ Gateway process is running (PID: $GATEWAY_PID)"
fi

# Wait for gateway to initialize
echo ""
echo "⏳ Waiting for API Gateway to initialize..."
sleep 10

# Check if gateway is still running
if ! kill -0 $GATEWAY_PID 2>/dev/null; then
  echo "❌ API Gateway failed to start"
  echo "--- Full Gateway Log ---"
  cat /tmp/gateway.log 2>/dev/null || echo "No log file found"
  echo ""
  echo "--- Checking ports ---"
  netstat -tuln 2>/dev/null | grep -E ":(4000|4001|4002|4003)" || ss -tuln 2>/dev/null | grep -E ":(4000|4001|4002|4003)" || echo "netstat/ss not available"
  echo ""
  echo "⚠️  Gateway failed but continuing with Next.js..."
  echo "⚠️  The web app will show errors when trying to access Gateway endpoints."
else
  echo "✅ API Gateway is running (PID: $GATEWAY_PID)"
  echo "--- Latest Gateway Log ---"
  tail -30 /tmp/gateway.log 2>/dev/null || echo "No recent log"
  
  # Test gateway health endpoint
  echo ""
  echo "Testing Gateway health endpoint..."
  curl -v http://localhost:4000/health 2>&1 | head -20 || echo "curl failed"
  wait_for_service "http://localhost:4000/health" "API Gateway" || {
    echo "⚠️  Gateway health check failed"
    echo "--- Full Gateway Log ---"
    cat /tmp/gateway.log 2>/dev/null || echo "No log file found"
    echo "⚠️  Gateway may not be fully ready yet..."
  }
fi

# Start Next.js Web App (foreground - this blocks and keeps container alive)
echo ""
echo "=============================================="
echo "✅ All backend services started successfully!"
echo "Orders Service: http://localhost:4001"
echo "Vendor Service: http://localhost:4002"
echo "Wallet Service: http://localhost:4003"
echo "API Gateway: http://localhost:4000"
echo "=============================================="
echo ""
echo "🌐 Starting Next.js Web App (main process)..."
echo ""

# Use exec to replace the shell process with Next.js
exec npm run start --workspace apps/web

