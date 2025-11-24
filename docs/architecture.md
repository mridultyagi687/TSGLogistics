## TSG Logistics Aggregator Architecture (MVP)

### Vision Summary
TSG Logistics Aggregator provides an end-to-end logistics orchestration layer purpose-built for Indian FTL and part-load operations. The MVP targets parity with incumbent load boards while introducing a defensible vendor marketplace and unified wallet.

### Guiding Principles
- **Domain-driven modularity** to iterate on complex workflows (loads, trips, vendors, wallet) independently.
- **Event-driven extensibility** for telemetry fan-out, exception handling, and future ML-driven decisions.
- **Offline-first mobility** to support drivers and vendors in low-connectivity corridors.
- **Secure-by-default** architecture with tenant isolation, RBAC/ABAC, and auditable financial flows.

### High-Level Component Map
- `web`: Next.js app for shipper, fleet, and vendor portal experiences. Uses React Server Components, Tailwind, server actions, and localized theming.
- `mobile`: React Native monorepo (Expo) providing driver and vendor mobile apps with background location, push notifications, and offline caches.
- `api-gateway`: NestJS edge service orchestrating downstream microservices, enforcing auth, rate limits, and aggregating responses for the web/mobile clients.
- `identity-service`: AuthN/AuthZ (Keycloak or Auth0 compatible) managing organizations, users, roles, and OIDC flows.
- `orders-service`: Owns load orders, trip lifecycle, assignments, detention tracking, and SLA audits. Persists to the `orders` schema through Prisma ORM.
- `vendor-service`: Manages vendor onboarding (KYC), catalogs, marketplace search, and rating moderation. Persists to the `vendors` schema.
- `wallet-service`: Handles wallet accounts, escrow flows, spend controls, and payouts with a ledger-first data model (`wallet` schema).
- `telemetry-service`: Ingests location streams (TSG devices, mobile SDK), normalizes to Kafka, derives ETAs, detour detection, and feeds live tracking.
- `doc-service`: Handles document storage, OCR pipeline hooks, signed URLs, and compliance metadata.
- `ops-console`: React Admin surface consuming gateway APIs for operations, dispute resolution, and vendor verifications.
- `analytics-pipeline`: dbt + BigQuery models fed via CDC from Postgres replicas and events from Kafka for reporting dashboards.

### Data & Messaging Layer
- **Primary DB**: Amazon RDS for PostgreSQL with logical replication; schemas partitioned by bounded context (`orders`, `vendors`, `wallet`, etc.). Prisma ORM mediates application access with typed models and migrations per service.
- **Search**: Amazon OpenSearch for vendor catalog, load/trip search, and geo queries.
- **Cache**: Redis (ElastiCache) for session tokens, rate limits, telemetry hot paths.
- **Event Bus**: Kafka (MSK) for telemetry stream, wallet ledger events, and async workflows (notifications, ETA recalculations).
- **Object Storage**: Amazon S3 for documents, media, and analytics dumps.

### Service Responsibilities & Contracts
- **Orders Service**
  - REST endpoints: `/loads`, `/trips`.
  - Publishes domain events (`load.published`, `trip.started`) to Kafka for downstream analytics and notifications.
  - Enforces SLA metrics (detention, ETA variance) and houses trip stop history.
- **Vendor Service**
  - REST endpoints: `/vendors`.
  - Backed by OpenSearch for geo + full-text search (Phase-2).
  - Integrates with verification workflows and rating moderation pipeline.
- **Wallet Service**
  - REST endpoints: `/wallets`, `/wallets/:id/transactions` (roadmap).
  - Maintains double-entry ledger and orchestrates payouts via RazorpayX.
  - Emits ledger events to Kafka for reconciliation and analytics.
- **API Gateway**
  - Single ingress for web/mobile apps.
  - Handles request correlation IDs, caching of read-heavy endpoints, schema validation, and API key enforcement for partners.
  - Coordinates cross-service workflows (e.g., booking = orders + wallet escrow).

### Integration Surface
- Payments: RazorpayX for collections and payouts; reconciliation webhooks.
- Maps & Routing: MapmyIndia primary, Google Maps fallback.
- FASTag/Fuel: Partner APIs ingested via wallet-service adapters.
- Messaging: Twilio/ValueFirst for SMS, WhatsApp Business API, FCM for push.
- Compliance: ASP-GSP partners for GST, eWay/eChallan ingestion.

### Cross-Cutting Concerns
- **Security**: OAuth2/OIDC, RBAC/ABAC, field-level encryption for PII, signed S3 URLs, audit trails in PostgreSQL & Kafka.
- **Observability**: OpenTelemetry instrumentation, Prometheus metrics, Grafana dashboards, and centralized tracing.
- **Resilience**: Circuit breakers (Hystrix-like via Resilience4J/ship.js), retries, idempotent APIs, SLO monitoring.
- **Localization**: i18n-ready strings, support for English/Hindi in MVP with extendable locales.

### Deployment Blueprint
- **Infrastructure as Code**: Terraform modules provisioning VPC, EKS, RDS, MSK, OpenSearch, S3, CloudFront, and supporting IAM.
- **Runtime**: Containerized services on AWS EKS (Fargate for stateless services, managed node groups for stateful sidecars). Each microservice ships its own Docker image (multi-stage builds with Prisma client generation).
- **CI/CD**: GitHub Actions → build, lint, test, containerize, deploy via ArgoCD.
- **Environments**: `dev` (shared), `staging` (pre-prod, data masked), `prod` (multi-AZ). Feature environments via preview deployments.

### Local Orchestration
- Docker Compose spins up PostgreSQL, Redis, Orders, Vendor, Wallet services, and the API Gateway. Web can run locally against `http://localhost:4000`.
- Each service reads a dedicated schema (`orders`, `vendors`, `wallet`) while sharing the same Postgres instance to simplify development.
- `npm run prisma:migrate:<service>` applies migrations per bounded context before starting containers.

### MVP Scope Alignment
- Shipper booking flow: `web` + `orders-service` + `wallet-service`.
- Driver tracking: `mobile` + `telemetry-service`.
- Vendor marketplace: `web` + `mobile` + `vendor-service` + OpenSearch.
- Wallet skeleton: `wallet-service` + Razorpay sandbox.
- Ops console: lightweight Next.js admin using the same REST APIs.

### Vendor Assignment Workflow (M2–3)
- **Data model**: `vendor-service` owns `Assignment`, `AssignmentEvent`, and `VendorCapability` collections. `orders-service` tracks cross-service status via `LoadOrder.assignment*` fields and optional `Trip.assignmentId`.
- **Lifecycle**: Publishing a load moves it to `assignmentStatus = SOURCING`. Vendor assignments transition through `PENDING → OFFERED → ACCEPTED/DECLINED/CANCELLED`, with every change mirrored onto the load record.
- **APIs**:
  - Vendor service exposes `/assignments` CRUD + `/vendors/:id/capabilities`; gateway proxies surface these at `/api/vendor-assignments` and `/api/vendors/:id/capabilities`.
  - Orders service provides `/loads/:id/assignment` endpoints for linking, updating, and clearing assignments; gateway forwards them under `/api/loads/:id/assignment`.
- **Orchestration**: Assignment mutations emit telemetry hooks (`load.assignment.*`). A follow-on async worker (to be implemented) consumes publish events, scores vendors, and seeds assignment offers while recording capability snapshots.
- **UI/notifications**: Web portal now has a dedicated surface for assignment candidate lists, manual override, and status badges. Accept/decline outcomes will trigger SMS/WhatsApp push via the messaging adapters.
- **Testing & rollout**: Contract tests cover orders↔vendor interactions, Prisma migrations seed fixture data, and an end-to-end scenario asserts publish → offer → accept → trip booking. Feature flags wrap the new flows so existing loads backfill with `UNASSIGNED` status before rollout.

### Evolution Path
- Phase 2 introduces ML microservices (Python/FastAPI) consuming telemetry + historical data for back-haul, detention prediction, and maintenance scoring.
- Multi-tenant API access via API keys and webhooks for enterprise integrations.
- Extend wallet to physical/virtual card issuance through partner APIs.

