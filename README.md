## TSG Logistics Aggregator

Monorepo housing the MVP foundations for the TSG Logistics Aggregator platform: a unified experience for shippers, fleet owners, drivers, and roadside vendors across India.

### Repository Layout
- `apps/web` – Next.js portal serving shipper, fleet, and vendor web experiences.
- `apps/mobile` – Placeholder for React Native (Expo) driver/vendor apps.
- `services/api-gateway` – Edge service routing all client traffic to downstream microservices.
- `services/orders-service` – Load, trip, and SLA lifecycle microservice (Postgres schema: `orders`).
- `services/vendor-service` – Vendor onboarding & marketplace microservice (schema: `vendors`).
- `services/wallet-service` – Unified wallet & ledger microservice (schema: `wallet`).
- `packages/shared` – Reusable TypeScript contracts shared across services.
- `docs` – Architecture and planning artefacts.
- `apps/api` – Legacy monolith retained temporarily for reference during migration.

### Getting Started
1. **Install tooling**
   - Node.js `>= 18.18`
   - npm `>= 9`
   - Docker (for local Postgres/Redis)
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Prepare environment files (if overriding defaults)**
   - Copy each service template:
     ```
     cp services/orders-service/env.example services/orders-service/.env
     cp services/vendor-service/env.example services/vendor-service/.env
     cp services/wallet-service/env.example services/wallet-service/.env
     cp services/api-gateway/env.example services/api-gateway/.env
     cp apps/web/env.example apps/web/.env.local
     ```
  - Populate `apps/web/.env.local` with the web credentials:
    - `NEXT_PUBLIC_GATEWAY_URL`, `GATEWAY_SERVICE_TOKEN`, `GATEWAY_ORG_ID` / `DEFAULT_GATEWAY_ORG_ID` for fallback service tokens.
    - `NEXTAUTH_SECRET`, `REDIS_URL`, `TELEMETRY_CHANNEL`, `KEYCLOAK_ISSUER`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, `KEYCLOAK_ORG_CLAIM` to enable the Keycloak/OpenID Connect login. Once configured, the loads dashboard signs in via NextAuth, streams live telemetry from Redis, and forwards bearer tokens automatically.
4. **Apply database schema (first run)**
   ```bash
   npm run prisma:migrate:orders
   npm run prisma:migrate:vendor
   npm run prisma:migrate:wallet
   ```
   - Trip milestone fields (`scheduledAt`, `startedAt`, `completedAt`, `cancelledAt`) were added to the orders service. Run `npm run prisma:migrate:orders` after pulling these changes to keep the database in sync.
   - For production/staging environments, run the deploy-safe commands:
     ```bash
     npm run prisma:deploy:orders
     npm run prisma:deploy:vendor
     npm run prisma:deploy:wallet
     ```
5. **Start the full stack (Docker)**
   ```bash
   docker compose up --build
   ```
   The stack exposes:
   - Gateway: `http://localhost:4000`
   - Orders Service: `http://localhost:4001`
   - Vendor Service: `http://localhost:4002`
   - Wallet Service: `http://localhost:4003`
   - Postgres: `localhost:5432`
6. **Run the web app (local dev)**
   ```bash
   npm run dev:web
   ```

### API Surface (MVP via Gateway)
- `POST /api/loads` – create a load order draft.
- `PATCH /api/loads/:id/publish` – mark a load as published.
- `POST /api/trips` – schedule a trip for a load.
- `PATCH /api/trips/:id/start|complete|cancel` – update trip lifecycle.
- `POST /api/vendors` – onboard a vendor with catalog metadata.
- `POST /api/wallets` – open a unified wallet account.
- `GET /health` – gateway health check.
- `GET /api/*/health` – downstream service health probes.

> **Note:** Core entities persist to PostgreSQL via Prisma. Kafka/OpenSearch integrations land in upcoming milestones.

### Development Scripts
- `npm run lint` / `npm run format` / `npm run typecheck`
- `npm run build:web` / `npm run build:orders` / `npm run build:vendor` / `npm run build:wallet` / `npm run build:gateway`
- `npm run prisma:migrate:<service>` / `npm run prisma:generate:<service>` / `npm run prisma:deploy:<service>`
- `npm run dev:web` / `npm run dev:orders` / `npm run dev:vendor` / `npm run dev:wallet` / `npm run dev:gateway`

### Continuous Integration
GitHub Actions workflow (`.github/workflows/ci.yml`) validates linting, type safety, and builds across workspaces on every PR and push to `main`. Upcoming iterations will add service-specific pipelines (tests + Docker image publishing).

### Telemetry Streams
- The `/loads` workspace now consumes a Redis-backed server-sent events feed exposed at `GET /api/telemetry/stream`, falling back to snapshot polling when the stream or Redis subscriber is unavailable. This primes the UI for Kafka-backed telemetry and WebSocket fan-out in later milestones.

### Local Authentication (Keycloak)
1. **Start Keycloak**
   ```bash
   docker compose up keycloak -d
   ```
   - Keycloak Admin Console: `http://localhost:8180/admin`
   - **Admin Console credentials**: `admin` / `admin` (ONLY for managing Keycloak, NOT for logging into the application)
   - The pre-seeded `tsg` realm imports with a confidential client `tsg-web`
   - **Custom Theme**: The realm is configured to use the custom "tsg" theme with Swiggy-inspired orange design
2. **Configure the web app**
   - Copy `apps/web/env.example` to `.env.local` and set:
     ```
     NEXTAUTH_SECRET=$(openssl rand -base64 32)
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
   - Remove `GATEWAY_SERVICE_TOKEN` once login works; org scope falls back to `DEFAULT_GATEWAY_ORG_ID` when the ID claim is absent.
3. **Sign in to TSG Logistics Application**
   - Run `npm run dev:web`, open `http://localhost:3000`, and click **Launch Dashboard** or **Sign in**.
   - **Application User Credentials** (for logging into TSG Logistics):
     - Username: `ops-lead`
     - Password: `ChangeMe123!`
   - **Important**: Do NOT use `admin/admin` - those are only for the Keycloak Admin Console at `http://localhost:8180/admin`
   - The `ops-lead` user has the `admin` role in the application and can access all features including role management.

### Roadmap Highlights
The implementation roadmap aligns with the [architecture overview](docs/architecture.md) and the product PRD.

- **M0–1 Foundations**: Replace in-memory stores with PostgreSQL + Prisma, add org/user management, integrate Redis cache, telemetry ingestion skeleton.
- **M2–3 MVP Beta**: Payment gateway sandbox integration, vendor job assignment flows, FASTag read-only dashboards, Ops console web UI.
- **M4 Launch**: Detention meter, ePOD uploads, WhatsApp tracking links, dispute workflows.
- **M5–6 Defensibility**: Back-haul matcher, predictive maintenance scoring, multilingual UX, external partner integrations (fuel, FASTag, compliance).

### Contributing
1. Branch from `main`.
2. Ensure `npm run lint && npm run typecheck && npm run build:web && npm run build:gateway && npm run build:orders && npm run build:vendor && npm run build:wallet` pass locally.
3. Submit a PR referencing the relevant roadmap item. Describe any new contracts exposed via the gateway (include OpenAPI snippet where feasible).

### References
- [Product Requirement & Architecture](docs/architecture.md)
- Source specification: `TSG Logistics Aggregator – PRD & Architecture (v1)`

