# ─── Stage 1: build the Angular app ──────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first (cached layer when only source changes).
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build (production by default per angular.json).
COPY . .
RUN npm run build

# ─── Stage 2: serve with nginx ───────────────────────────────────
FROM nginx:alpine

# Copy the built browser bundle into nginx's web root.
COPY --from=build /app/dist/lifting-hurts-frontend/browser /usr/share/nginx/html

# Replace the default nginx config with ours (the /api proxy lives here).
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80