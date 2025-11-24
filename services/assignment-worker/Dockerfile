# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS builder
COPY package*.json ./
COPY tsconfig*.json ./
COPY services/assignment-worker/package*.json services/assignment-worker/
COPY services/assignment-worker/tsconfig*.json services/assignment-worker/
COPY packages/shared/package*.json packages/shared/
RUN npm install --ignore-scripts
COPY . .
RUN npm run build --workspace @tsg/shared
RUN npm run build:assignment-worker

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/services/assignment-worker/package*.json services/assignment-worker/
COPY --from=builder /usr/src/app/packages/shared/package*.json packages/shared/
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /usr/src/app/services/assignment-worker/dist ./dist
COPY services/assignment-worker/package.json ./package.json
CMD ["node", "dist/services/assignment-worker/src/main.js"]
