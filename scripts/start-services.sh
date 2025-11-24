#!/bin/bash

# Start all services with proper error handling and health checks
# This script ensures services start in the correct order and handles failures gracefully

set -e

echo "🚀 Starting TSG Logistics Services..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to wait for a service to be ready
wait_for_service() {
  local service_name=$1
  local url=$2
  local max_attempts=30
  local attempt=0

  echo -e "${YELLOW}Waiting for ${service_name} to be ready...${NC}"
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -f -s "$url" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ ${service_name} is ready!${NC}"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  
  echo -e "${RED}✗ ${service_name} failed to start after ${max_attempts} seconds${NC}"
  return 1
}

# Start Orders Service
echo -e "\n${YELLOW}Starting Orders Service (port 4001)...${NC}"
ORDERS_PORT=4001 npm run start --workspace @tsg/orders-service &
ORDERS_PID=$!

# Start Vendor Service
echo -e "\n${YELLOW}Starting Vendor Service (port 4002)...${NC}"
VENDOR_PORT=4002 npm run start --workspace @tsg/vendor-service &
VENDOR_PID=$!

# Start Wallet Service
echo -e "\n${YELLOW}Starting Wallet Service (port 4003)...${NC}"
WALLET_PORT=4003 npm run start --workspace @tsg/wallet-service &
WALLET_PID=$!

# Wait for microservices to be ready
sleep 3

# Check if services are running
if ! kill -0 $ORDERS_PID 2>/dev/null; then
  echo -e "${RED}Orders Service failed to start${NC}"
  exit 1
fi

if ! kill -0 $VENDOR_PID 2>/dev/null; then
  echo -e "${RED}Vendor Service failed to start${NC}"
  exit 1
fi

if ! kill -0 $WALLET_PID 2>/dev/null; then
  echo -e "${RED}Wallet Service failed to start${NC}"
  exit 1
fi

# Start API Gateway
echo -e "\n${YELLOW}Starting API Gateway (port 4000)...${NC}"
PORT=4000 ORDERS_SERVICE_URL=http://localhost:4001 VENDOR_SERVICE_URL=http://localhost:4002 WALLET_SERVICE_URL=http://localhost:4003 npm run start --workspace @tsg/api-gateway &
GATEWAY_PID=$!

# Wait for gateway to be ready
sleep 3

if ! kill -0 $GATEWAY_PID 2>/dev/null; then
  echo -e "${RED}API Gateway failed to start${NC}"
  exit 1
fi

# Wait for gateway health check
wait_for_service "API Gateway" "http://localhost:4000/health" || {
  echo -e "${RED}API Gateway health check failed${NC}"
  exit 1
}

# Start Next.js Web App
echo -e "\n${YELLOW}Starting Next.js Web App (port ${PORT:-3000})...${NC}"
PORT=${PORT:-3000} npm run start --workspace apps/web &
WEB_PID=$!

# Wait for web app
sleep 3

if ! kill -0 $WEB_PID 2>/dev/null; then
  echo -e "${RED}Web App failed to start${NC}"
  exit 1
fi

echo -e "\n${GREEN}✅ All services started successfully!${NC}"
echo "======================================"
echo "Orders Service:    http://localhost:4001"
echo "Vendor Service:    http://localhost:4002"
echo "Wallet Service:    http://localhost:4003"
echo "API Gateway:       http://localhost:4000"
echo "Web App:           http://localhost:${PORT:-3000}"
echo "======================================"

# Wait for all processes
wait

