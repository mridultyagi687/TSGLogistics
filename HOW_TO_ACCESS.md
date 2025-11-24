# How to Access TSG Logistics App

## Quick Start Guide

### Option 1: With Docker (Recommended)

#### Step 1: Start Docker Infrastructure
```bash
cd /Users/mridul/Documents/TSGLogistics
docker compose up -d postgres redis keycloak zookeeper kafka
```

Wait 30-60 seconds for services to start. Verify:
```bash
docker ps
```

#### Step 2: Setup Database (First Time Only)
```bash
npm run prisma:generate:orders && npm run prisma:migrate:orders
npm run prisma:generate:vendor && npm run prisma:migrate:vendor
npm run prisma:generate:wallet && npm run prisma:migrate:wallet
```

#### Step 3: Start Backend Services

Open **4 separate terminal windows/tabs**:

**Terminal 1 - Orders Service:**
```bash
cd services/orders-service
npm run start:dev
```

**Terminal 2 - Vendor Service:**
```bash
cd services/vendor-service
npm run start:dev
```

**Terminal 3 - Wallet Service:**
```bash
cd services/wallet-service
npm run start:dev
```

**Terminal 4 - API Gateway:**
```bash
cd services/api-gateway
npm run start:dev
```

#### Step 4: Start Frontend

**Terminal 5 - Web App:**
```bash
cd apps/web
npm run dev
```

#### Step 5: Access the App

Open your browser and go to:
- **Main App**: http://localhost:3000
- **API Gateway**: http://localhost:4000/health
- **Keycloak Admin**: http://localhost:8180/admin

**Login Credentials:**
- Username: `ops-lead`
- Password: `ChangeMe123!`

---

### Option 2: Without Docker (Local Services)

#### Step 1: Install PostgreSQL & Redis
```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install Redis
brew install redis
brew services start redis
```

#### Step 2: Setup Database
```bash
# Create database
createdb tsg_logistics

# Create schemas
psql tsg_logistics -c "CREATE SCHEMA IF NOT EXISTS orders; CREATE SCHEMA IF NOT EXISTS vendors; CREATE SCHEMA IF NOT EXISTS wallet;"

# Run migrations
npm run prisma:generate:orders && npm run prisma:migrate:orders
npm run prisma:generate:vendor && npm run prisma:migrate:vendor
npm run prisma:generate:wallet && npm run prisma:migrate:wallet
```

#### Step 3: Start Services

Same as Option 1, Steps 3-4 (start backend services and frontend)

---

## Access URLs

Once everything is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | Main application interface |
| **API Gateway** | http://localhost:4000 | API endpoint |
| **Orders Service** | http://localhost:4001 | Orders microservice |
| **Vendor Service** | http://localhost:4002 | Vendor microservice |
| **Wallet Service** | http://localhost:4003 | Wallet microservice |
| **Keycloak Admin** | http://localhost:8180/admin | Authentication admin console |

---

## Verify Services Are Running

### Check Backend Services
```bash
curl http://localhost:4000/health
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
```

### Check Docker Containers
```bash
docker ps
```

### Check Ports
```bash
lsof -i :3000  # Web app
lsof -i :4000  # API Gateway
lsof -i :4001  # Orders
lsof -i :4002  # Vendor
lsof -i :4003  # Wallet
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on specific port
lsof -ti :PORT_NUMBER | xargs kill -9

# Or kill all service ports at once
for port in 3000 4000 4001 4002 4003; do lsof -ti :$port | xargs kill -9 2>/dev/null; done
```

### Services Won't Start
1. Check if dependencies are installed: `npm install`
2. Check if database is running: `docker ps` or `brew services list`
3. Check service logs in the terminal where you started them

### Can't Access http://localhost:3000
1. Make sure the web app is running: Check Terminal 5
2. Wait 10-20 seconds after starting for Next.js to compile
3. Check for errors in the terminal
4. Try refreshing the browser

### Database Connection Errors
1. Verify PostgreSQL is running: `docker ps | grep postgres` or `brew services list | grep postgresql`
2. Check connection string in `.env` files
3. Ensure migrations have run successfully

---

## Quick Commands Reference

```bash
# Start all Docker services
docker compose up -d postgres redis keycloak zookeeper kafka

# Stop all Docker services
docker compose down

# Kill all Node processes on service ports
for port in 3000 4000 4001 4002 4003; do lsof -ti :$port | xargs kill -9 2>/dev/null; done

# Check all service health
curl http://localhost:4000/health && echo " - Gateway"
curl http://localhost:4001/health && echo " - Orders"
curl http://localhost:4002/health && echo " - Vendor"
curl http://localhost:4003/health && echo " - Wallet"
```

---

## First Time Setup Checklist

- [ ] Docker Desktop is running (if using Docker)
- [ ] PostgreSQL and Redis are installed and running
- [ ] Database migrations have been run
- [ ] All backend services are started (4 terminals)
- [ ] Web app is started (Terminal 5)
- [ ] Can access http://localhost:3000
- [ ] Can login with `ops-lead` / `ChangeMe123!`

---

## Need Help?

If you encounter issues:
1. Check the terminal logs for error messages
2. Verify all services are running with the health check commands
3. Ensure ports are not blocked by other applications
4. Check the `NO_DOCKER_SETUP.md` guide for local setup without Docker

