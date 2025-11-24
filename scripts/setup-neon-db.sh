#!/bin/bash

# Setup script for Neon database
# This script helps set up the database schemas in Neon

set -e

echo "🚀 TSG Logistics - Neon Database Setup"
echo "========================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it to your Neon database connection string:"
    echo "export DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'"
    exit 1
fi

echo "📦 Creating database schemas..."
echo ""

# Extract base connection string (without schema)
BASE_URL=$(echo $DATABASE_URL | sed 's/[?&]schema=[^&]*//')

# Create schemas
psql "$BASE_URL" <<EOF
-- Create required schemas
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant permissions (adjust username as needed)
GRANT ALL PRIVILEGES ON SCHEMA orders TO current_user;
GRANT ALL PRIVILEGES ON SCHEMA vendors TO current_user;
GRANT ALL PRIVILEGES ON SCHEMA wallet TO current_user;
GRANT ALL PRIVILEGES ON SCHEMA auth TO current_user;

-- Verify schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name IN ('orders', 'vendors', 'wallet', 'auth');
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schemas created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run migrations for each service:"
    echo "   - Orders: DATABASE_URL='$BASE_URL?schema=orders' npm run prisma:migrate --workspace @tsg/orders-service"
    echo "   - Vendor: DATABASE_URL='$BASE_URL?schema=vendors' npm run prisma:migrate --workspace @tsg/vendor-service"
    echo "   - Wallet: DATABASE_URL='$BASE_URL?schema=wallet' npm run prisma:migrate --workspace @tsg/wallet-service"
    echo ""
    echo "2. Set up auth tables (run apps/web/prisma/init.sql)"
else
    echo ""
    echo "❌ Error creating schemas. Please check your DATABASE_URL and try again."
    exit 1
fi

