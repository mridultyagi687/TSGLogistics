FROM node:18-bullseye-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY services/orders-service/package.json services/orders-service/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --ignore-scripts --workspaces --include-workspace-root=false

COPY . .
RUN npm run build --workspace @tsg/shared
RUN npm run prisma:generate:orders && npm run build:orders

FROM node:18-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY services/orders-service/package.json services/orders-service/package.json
COPY --from=build /app/services/orders-service/dist ./services/orders-service/dist

WORKDIR /app/services/orders-service
EXPOSE 4001
CMD ["node", "dist/main.js"]

