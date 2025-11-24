#!/bin/bash

# Start all services in a single process
# This script runs all microservices together

set -e

echo "🚀 Starting TSG Logistics Services..."

# Start services in background
cd services/orders-service && npm start &
ORDERS_PID=$!

cd ../vendor-service && npm start &
VENDOR_PID=$!

cd ../wallet-service && npm start &
WALLET_PID=$!

cd ../api-gateway && npm start &
GATEWAY_PID=$!

cd ../../apps/web && npm start &
WEB_PID=$!

echo "✅ All services started"
echo "Orders Service PID: $ORDERS_PID"
echo "Vendor Service PID: $VENDOR_PID"
echo "Wallet Service PID: $WALLET_PID"
echo "API Gateway PID: $GATEWAY_PID"
echo "Web App PID: $WEB_PID"

# Wait for all processes
wait

