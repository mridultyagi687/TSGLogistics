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
# Handle both ?schema= and &schema= formats
BASE_URL=$(echo $DATABASE_URL | sed 's/[?&]schema=[^&]*//' | sed 's/[?&]channel_binding=[^&]*//')

# Add channel_binding back if it was in the original URL
if [[ $DATABASE_URL == *"channel_binding"* ]]; then
    BASE_URL="${BASE_URL}&channel_binding=require"
fi

echo "Using base URL: ${BASE_URL}"
echo ""

# Create schemas using psql if available, otherwise provide SQL
if command -v psql &> /dev/null; then
    echo "Creating schemas with psql..."
    psql "$BASE_URL" <<EOF
-- Create required schemas
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant permissions
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
    else
        echo ""
        echo "❌ Error creating schemas. Please check your DATABASE_URL and try again."
        exit 1
    fi
else
    echo "⚠️  psql not found. Please run this SQL manually in Neon SQL Editor:"
    echo ""
    echo "=========================================="
    echo "SQL to run in Neon SQL Editor:"
    echo "=========================================="
    cat <<'SQL'
-- Create required schemas
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA orders TO neondb_owner;
GRANT ALL PRIVILEGES ON SCHEMA vendors TO neondb_owner;
GRANT ALL PRIVILEGES ON SCHEMA wallet TO neondb_owner;
GRANT ALL PRIVILEGES ON SCHEMA auth TO neondb_owner;
SQL
    echo ""
    echo "=========================================="
fi

echo ""
echo "📋 Connection strings for each service:"
echo ""
echo "Orders Service:"
echo "${BASE_URL}&schema=orders"
echo ""
echo "Vendor Service:"
echo "${BASE_URL}&schema=vendors"
echo ""
echo "Wallet Service:"
echo "${BASE_URL}&schema=wallet"
echo ""
echo "Web App (Auth):"
echo "${BASE_URL}&schema=auth"
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the connection strings above to your Render environment variables"
echo "2. Run migrations in each service after deployment"
