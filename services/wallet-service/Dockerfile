FROM node:18-bullseye-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
COPY services/wallet-service/package.json services/wallet-service/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --ignore-scripts --workspaces --include-workspace-root=false

COPY . .
RUN npm run build --workspace @tsg/shared
RUN npm run prisma:generate:wallet && npm run build:wallet

FROM node:18-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY services/wallet-service/package.json services/wallet-service/package.json
COPY --from=build /app/services/wallet-service/dist ./services/wallet-service/dist

WORKDIR /app/services/wallet-service
EXPOSE 4003
CMD ["node", "dist/main.js"]

