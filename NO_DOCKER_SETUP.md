# Running TSG Logistics Without Docker

This guide shows how to run the application using locally installed services instead of Docker containers.

---

## Prerequisites

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Create database:**
```bash
createdb tsg_logistics
# Or using psql:
psql postgres
CREATE DATABASE tsg_logistics;
\q
```

### 2. Install Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

### 3. Install Keycloak (Optional - for authentication)

**Option A: Download Standalone**
1. Download from: https://www.keycloak.org/downloads
2. Extract and run:
```bash
cd keycloak-XX.X.X/bin
./kc.sh start-dev --http-port=8180
```

**Option B: Skip Keycloak (for basic testing)**
- You can run services without Keycloak, but authentication won't work
- Set `KEYCLOAK_ISSUER` to empty or skip auth endpoints

### 4. Install Kafka & Zookeeper (Optional - for assignment worker)

**macOS (Homebrew):**
```bash
brew install kafka
brew services start zookeeper
brew services start kafka
```

**Or skip if not using assignment worker**

---

## Setup Steps

### Step 1: Configure Database Connection Strings

Each service needs a `.env` file with local PostgreSQL connection.

**Create `.env` files for each service:**

**services/orders-service/.env:**
```env
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/tsg_logistics?schema=orders
PORT=4001
```

**services/vendor-service/.env:**
```env
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/tsg_logistics?schema=vendors
PORT=4002
```

**services/wallet-service/.env:**
```env
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/tsg_logistics?schema=wallet
PORT=4003
```

**Replace `YOUR_USERNAME` with your PostgreSQL username** (usually your macOS username, or `postgres`)

**To find your username:**
```bash
whoami
# Or check PostgreSQL users:
psql postgres -c "\du"
```

### Step 2: Create Database Schemas

Connect to PostgreSQL and create schemas:

```bash
psql tsg_logistics
```

Then run:
```sql
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
\q
```

### Step 3: Run Database Migrations

```bash
# Generate Prisma clients
npm run prisma:generate:orders
npm run prisma:generate:vendor
npm run prisma:generate:wallet

# Run migrations
npm run prisma:migrate:orders
npm run prisma:migrate:vendor
npm run prisma:migrate:wallet
```

### Step 4: Configure API Gateway

**services/api-gateway/.env:**
```env
PORT=4000
ORDERS_SERVICE_URL=http://localhost:4001
VENDOR_SERVICE_URL=http://localhost:4002
WALLET_SERVICE_URL=http://localhost:4003
CORS_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
TELEMETRY_CHANNEL=telemetry:gateway:events
TRIP_LIFECYCLE_WEBHOOK_URL=
```

### Step 5: Configure Web App

**apps/web/.env.local:**
```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
REDIS_URL=redis://localhost:6379
TELEMETRY_CHANNEL=telemetry:gateway:events
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

**If using Keycloak:**
```env
KEYCLOAK_ISSUER=http://localhost:8180/realms/tsg
KEYCLOAK_CLIENT_ID=tsg-web
KEYCLOAK_CLIENT_SECRET=tsg-web-secret
KEYCLOAK_ORG_CLAIM=orgId
KEYCLOAK_ADMIN_URL=http://localhost:8180
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_REALM=tsg
```

**If NOT using Keycloak (skip auth):**
```env
# Leave Keycloak variables empty or remove them
```

---

## Start Services

### Terminal 1 - Orders Service
```bash
cd services/orders-service
npm run start:dev
```

### Terminal 2 - Vendor Service
```bash
cd services/vendor-service
npm run start:dev
```

### Terminal 3 - Wallet Service
```bash
cd services/wallet-service
npm run start:dev
```

### Terminal 4 - API Gateway
```bash
cd services/api-gateway
npm run start:dev
```

### Terminal 5 - Web App
```bash
cd apps/web
npm run dev
```

---

## Verify Services

**Check PostgreSQL:**
```bash
psql tsg_logistics -c "\dn"  # List schemas
```

**Check Redis:**
```bash
redis-cli ping
```

**Check Services:**
```bash
curl http://localhost:4000/health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
```

---

## Troubleshooting

### PostgreSQL Connection Error

**Error:** `FATAL: password authentication failed`

**Solution:**
1. Check if PostgreSQL allows local connections without password:
```bash
# Edit pg_hba.conf (location varies)
# Find: /opt/homebrew/var/postgresql@16/pg_hba.conf
# Or: /usr/local/var/postgresql@16/pg_hba.conf

# Change this line:
# host    all             all             127.0.0.1/32            scram-sha-256
# To:
host    all             all             127.0.0.1/32            trust
```

2. Restart PostgreSQL:
```bash
brew services restart postgresql@16
```

3. Or use password in connection string:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/tsg_logistics?schema=orders
```

### Redis Connection Error

**Error:** `ECONNREFUSED`

**Solution:**
```bash
# Check if Redis is running
brew services list | grep redis

# Start Redis if not running
brew services start redis

# Test connection
redis-cli ping
```

### Schema Not Found Error

**Error:** `schema "orders" does not exist`

**Solution:**
```bash
psql tsg_logistics
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
\q
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::4001`

**Solution:**
```bash
# Find process using port
lsof -i :4001

# Kill process
kill -9 <PID>
```

---

## Quick Setup Script

Save this as `setup-local.sh`:

```bash
#!/bin/bash

# Create database
createdb tsg_logistics 2>/dev/null || echo "Database may already exist"

# Create schemas
psql tsg_logistics << EOF
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
EOF

# Generate Prisma clients
npm run prisma:generate:orders
npm run prisma:generate:vendor
npm run prisma:generate:wallet

# Run migrations
npm run prisma:migrate:orders
npm run prisma:migrate:vendor
npm run prisma:migrate:wallet

echo "Setup complete! Now start your services."
```

Make executable:
```bash
chmod +x setup-local.sh
./setup-local.sh
```

---

## Service URLs (Local)

- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Orders Service**: http://localhost:4001
- **Vendor Service**: http://localhost:4002
- **Wallet Service**: http://localhost:4003
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Keycloak** (if installed): http://localhost:8180

