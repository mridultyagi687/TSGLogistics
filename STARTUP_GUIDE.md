# Manual Startup Guide - TSG Logistics

This guide provides step-by-step instructions to manually start the frontend and backend services.

## Prerequisites

1. **Node.js** >= 18.18
2. **npm** >= 9
3. **Docker Desktop** (for PostgreSQL, Redis, Keycloak, Kafka, Zookeeper)
4. **Dependencies installed**: Run `npm install` from the root directory

---

## Part 1: Start Backend Infrastructure (Docker Services)

### Step 1: Start Docker Desktop
- Open Docker Desktop application on your machine
- Wait until Docker is fully started (whale icon in menu bar should be stable)

### Step 2: Install Docker Compose (if not available)

**Check if Docker Compose is available:**
```bash
docker compose version
```

If that fails, try:
```bash
docker-compose --version
```

**If neither works, install Docker Compose:**

**Option A: Install via Homebrew (macOS)**
```bash
brew install docker-compose
```

**Option B: Install Docker Desktop (Recommended)**
- Download from: https://www.docker.com/products/docker-desktop
- Docker Desktop includes Docker Compose V2
- After installation, restart your terminal

**Option C: Manual installation**
```bash
# Download docker-compose binary
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Start Infrastructure Services

**Method 1: Using Docker Compose V2 (if available)**
From the project root directory:
```bash
docker compose up -d postgres redis keycloak zookeeper kafka
```

**Method 2: Using docker-compose (with hyphen)**
```bash
docker-compose up -d postgres redis keycloak zookeeper kafka
```

**Method 3: Start services individually (if compose doesn't work)**
```bash
# PostgreSQL
docker run -d --name tsg-postgres -e POSTGRES_DB=tsg_logistics -e POSTGRES_USER=tsg -e POSTGRES_PASSWORD=tsg_secret -p 5432:5432 -v postgres-data:/var/lib/postgresql/data postgres:16-alpine

# Redis
docker run -d --name tsg-redis -p 6379:6379 -v redis-data:/data redis:7-alpine

# Zookeeper
docker run -d --name tsg-zookeeper -e ZOOKEEPER_CLIENT_PORT=2181 -e ZOOKEEPER_TICK_TIME=2000 -p 2181:2181 confluentinc/cp-zookeeper:7.5.3

# Kafka
docker run -d --name tsg-kafka --link tsg-zookeeper:zookeeper -e KAFKA_BROKER_ID=1 -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 -p 9092:9092 confluentinc/cp-kafka:7.5.3

# Keycloak
docker run -d --name tsg-keycloak -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -e KC_FEATURES=preview -p 8180:8080 -v $(pwd)/infra/keycloak/realm-export:/opt/keycloak/data/import -v $(pwd)/infra/keycloak/themes:/opt/keycloak/themes quay.io/keycloak/keycloak:23.0 start-dev --import-realm --spi-theme-static-max-age=-1 --spi-theme-cache-themes=false --spi-theme-cache-templates=false
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **Redis** on `localhost:6379`
- **Keycloak** on `http://localhost:8180`
- **Zookeeper** on `localhost:2181`
- **Kafka** on `localhost:9092`

**Verify services are running:**
```bash
docker ps
```

You should see containers: `tsg-postgres`, `tsg-redis`, `tsg-keycloak`, `tsg-zookeeper`, `tsg-kafka`

---

## Part 2: Setup Database (First Time Only)

### Step 4: Run Database Migrations
From the project root:

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

---

## Part 3: Start Backend Services

Each service needs to run in a separate terminal window/tab.

### Step 5: Start Orders Service
**Terminal 1:**
```bash
cd services/orders-service
npm run start:dev
```
Service runs on: `http://localhost:4001`

### Step 6: Start Vendor Service
**Terminal 2:**
```bash
cd services/vendor-service
npm run start:dev
```
Service runs on: `http://localhost:4002`

### Step 7: Start Wallet Service
**Terminal 3:**
```bash
cd services/wallet-service
npm run start:dev
```
Service runs on: `http://localhost:4003`

### Step 8: Start API Gateway
**Terminal 4:**
```bash
cd services/api-gateway
npm run start:dev
```
Service runs on: `http://localhost:4000`

**Note:** The API Gateway needs environment variables. Create `.env` file:
```bash
cp services/api-gateway/env.example services/api-gateway/.env
```

Edit `.env` and update URLs for local development:
```
PORT=4000
ORDERS_SERVICE_URL=http://localhost:4001
VENDOR_SERVICE_URL=http://localhost:4002
WALLET_SERVICE_URL=http://localhost:4003
CORS_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
TELEMETRY_CHANNEL=telemetry:gateway:events
```

### Step 9: (Optional) Start Assignment Worker
**Terminal 5:**
```bash
cd services/assignment-worker
npm run start:dev
```

---

## Part 4: Start Frontend (Web App)

### Step 10: Setup Frontend Environment
Create environment file:

```bash
cp apps/web/env.example apps/web/.env.local
```

Edit `apps/web/.env.local` and set:

```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
REDIS_URL=redis://localhost:6379
TELEMETRY_CHANNEL=telemetry:gateway:events
KEYCLOAK_ISSUER=http://localhost:8180/realms/tsg
KEYCLOAK_CLIENT_ID=tsg-web
KEYCLOAK_CLIENT_SECRET=tsg-web-secret
KEYCLOAK_ORG_CLAIM=orgId
KEYCLOAK_ADMIN_URL=http://localhost:8180
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_REALM=tsg
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```
Add the output to `NEXTAUTH_SECRET` in `.env.local`

### Step 11: Start Web Application
**Terminal 6:**
```bash
cd apps/web
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## Verification

### Check Backend Services
- API Gateway: `curl http://localhost:4000/health`
- Orders Service: `curl http://localhost:4001/health`
- Vendor Service: `curl http://localhost:4002/health`
- Wallet Service: `curl http://localhost:4003/health`

### Check Frontend
- Open browser: `http://localhost:3000`
- Login credentials:
  - Username: `ops-lead`
  - Password: `ChangeMe123!`

### Check Keycloak
- Admin Console: `http://localhost:8180/admin`
  - Username: `admin`
  - Password: `admin` (Keycloak admin only, not for app login)

---

## Quick Start Scripts (Alternative)

If you prefer using npm scripts from root:

```bash
# Start all backend services (requires separate terminals)
npm run start --workspace @tsg/orders-service &
npm run start --workspace @tsg/vendor-service &
npm run start --workspace @tsg/wallet-service &
npm run start --workspace @tsg/api-gateway &

# Start frontend
npm run dev --workspace @tsg/web
```

---

## Troubleshooting

### Port Already in Use
If a port is already in use:
- Find the process: `lsof -i :PORT_NUMBER`
- Kill the process: `kill -9 PID`

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker ps | grep postgres`
- Check connection string in service `.env` files
- Verify database exists: `docker exec -it tsg-postgres psql -U tsg -d tsg_logistics`

### Keycloak Not Ready
- Wait 30-60 seconds after starting Keycloak container
- Check logs: `docker logs tsg-keycloak`
- Verify health: `curl http://localhost:8180/health/ready`

### Service Won't Start
- Check if Prisma client is generated: `npm run prisma:generate` in service directory
- Verify all dependencies installed: `npm install`
- Check service logs for specific errors

---

## Stopping Services

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

### Stop Backend Services
Press `Ctrl+C` in each backend service terminal

### Stop Docker Services

**If using docker compose:**
```bash
docker compose down
# or
docker-compose down
```

**To remove volumes (clears data):**
```bash
docker compose down -v
# or
docker-compose down -v
```

**If started individually:**
```bash
docker stop tsg-postgres tsg-redis tsg-keycloak tsg-zookeeper tsg-kafka
docker rm tsg-postgres tsg-redis tsg-keycloak tsg-zookeeper tsg-kafka
```

