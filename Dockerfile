# Multi-stage build for both frontend and backend
FROM node:18-alpine as base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Frontend dependencies  
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production

# Backend builder
FROM base AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

# Frontend builder
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
COPY --from=backend-builder /app/backend/dist ./public/api-docs
RUN npm run build

# Production backend image
FROM base AS backend-runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

COPY --from=deps /app/backend/node_modules ./node_modules
COPY --from=backend-builder --chown=backend:nodejs /app/backend/dist ./dist
COPY --from=backend-builder --chown=backend:nodejs /app/backend/package.json ./package.json

USER backend
EXPOSE 8080
ENV PORT 8080
CMD ["node", "dist/server.js"]

# Production frontend image  
FROM base AS frontend-runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/frontend/node_modules ./node_modules
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder --chown=nextjs:nodejs /app/frontend/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]