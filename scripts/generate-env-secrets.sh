#!/bin/bash

# Generate secure secrets for production
# Run this script to generate AUTH_SECRET and other secure values

set -e

echo "🔐 Generating Production Secrets"
echo "================================"
echo ""

# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)

echo "AUTH_SECRET=$AUTH_SECRET"
echo ""
echo "Copy this value to your Render environment variables as 'AUTH_SECRET'"
echo ""
echo "✅ Secret generated successfully!"

