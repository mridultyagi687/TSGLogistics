#!/bin/bash

set -e

echo "🚀 Setting up TSG Logistics for local development (without Docker)"
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Please install it first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    brew install postgresql@16
    brew services start postgresql@16
    sleep 3
else
    echo "✓ PostgreSQL already installed"
fi

# Install Redis
if ! command -v redis-cli &> /dev/null; then
    echo "📦 Installing Redis..."
    brew install redis
    brew services start redis
    sleep 2
else
    echo "✓ Redis already installed"
fi

# Get username
USERNAME=$(whoami)
echo "Using PostgreSQL username: $USERNAME"
echo ""

# Create database
echo "🗄️  Creating database..."
createdb tsg_logistics 2>/dev/null || echo "  Database may already exist"

# Create schemas
echo "📋 Creating database schemas..."
psql tsg_logistics << EOF
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run database migrations:"
echo "   npm run prisma:generate:orders && npm run prisma:migrate:orders"
echo "   npm run prisma:generate:vendor && npm run prisma:migrate:vendor"
echo "   npm run prisma:generate:wallet && npm run prisma:migrate:wallet"
echo ""
echo "2. Start services in separate terminals:"
echo "   Terminal 1: cd services/orders-service && npm run start:dev"
echo "   Terminal 2: cd services/vendor-service && npm run start:dev"
echo "   Terminal 3: cd services/wallet-service && npm run start:dev"
echo "   Terminal 4: cd services/api-gateway && npm run start:dev"
echo "   Terminal 5: cd apps/web && npm run dev"
echo ""

