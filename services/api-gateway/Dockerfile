FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY services/api-gateway/package.json services/api-gateway/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install --ignore-scripts --workspaces --include-workspace-root=false

COPY . .
RUN npm run build --workspace @tsg/shared
RUN npm run build:gateway

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY services/api-gateway/package.json services/api-gateway/package.json
COPY --from=build /app/services/api-gateway/dist ./services/api-gateway/dist

WORKDIR /app/services/api-gateway
EXPOSE 4000
CMD ["node", "dist/main.js"]

