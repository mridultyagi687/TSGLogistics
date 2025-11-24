# Quick Start Guide - TSG Logistics

## Step-by-Step Manual Startup

### 1. Start Docker Infrastructure

Make sure Docker Desktop is running, then:

```bash
cd /Users/mridul/Documents/TSGLogistics
docker compose up -d postgres redis keycloak zookeeper kafka
```

Wait 30-60 seconds for containers to start. Verify:
```bash
docker ps
```

---

### 2. Setup Database (First Time Only)

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

### 3. Start Backend Services

**Open 4 separate terminal windows/tabs:**

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

---

### 4. Setup Frontend Environment (First Time Only)

```bash
cd apps/web
cp env.example .env.local
```

Edit `.env.local` and set:
```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
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

---

### 5. Start Frontend

**Terminal 5 - Web App:**
```bash
cd apps/web
npm run dev
```

---

### 6. Access the Application

- **Web App**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Keycloak Admin**: http://localhost:8180/admin

**Login Credentials:**
- Username: `ops-lead`
- Password: `ChangeMe123!`

---

## Service Ports

- **Frontend**: 3000
- **API Gateway**: 4000
- **Orders Service**: 4001
- **Vendor Service**: 4002
- **Wallet Service**: 4003
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Keycloak**: 8180
- **Kafka**: 9092
- **Zookeeper**: 2181

---

## Stop Services

- **Backend/Frontend**: Press `Ctrl+C` in each terminal
- **Docker**: `docker compose down`

---

## Troubleshooting

**Service won't start?**
- Check if port is already in use: `lsof -i :PORT`
- Check service logs in the terminal where it's running

**Database connection error?**
- Ensure PostgreSQL container is running: `docker ps | grep postgres`
- Wait a few seconds after starting Docker containers

**Keycloak not ready?**
- Wait 60-90 seconds after starting
- Check logs: `docker logs tsg-keycloak`

