# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — Build the Vite + React production bundle
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Vite embeds VITE_* variables at BUILD time, so they must be present here.
# Passed in via --build-arg (never hardcoded, never committed).
ARG VITE_KLAIM_API_URL
ARG VITE_DEMO_DID
ARG VITE_VERIFIER_ID
ARG VITE_KLAIM_MOCK
ARG VITE_KLAIM_MOCK_OUTCOME

ENV VITE_KLAIM_API_URL=$VITE_KLAIM_API_URL \
    VITE_DEMO_DID=$VITE_DEMO_DID \
    VITE_VERIFIER_ID=$VITE_VERIFIER_ID \
    VITE_KLAIM_MOCK=$VITE_KLAIM_MOCK \
    VITE_KLAIM_MOCK_OUTCOME=$VITE_KLAIM_MOCK_OUTCOME

# Install dependencies against the existing lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build (tsc -b && vite build -> dist/).
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — Serve the static build with nginx
# ---------------------------------------------------------------------------
FROM nginx:alpine AS runtime

# nginx config template. Cloud Run injects $PORT at runtime; envsubst renders
# it into the final config on container start.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Static production build into nginx web root.
COPY --from=build /app/dist /usr/share/nginx/html

# Default for local runs; Cloud Run overrides PORT at runtime.
ENV PORT=8080
# Restrict envsubst to ONLY ${PORT} so nginx runtime vars ($uri, $host, …)
# in the template are left intact.
ENV NGINX_ENVSUBST_FILTER='^PORT$'
EXPOSE 8080

# nginx:alpine's entrypoint runs envsubst over /etc/nginx/templates/*.template
# into /etc/nginx/conf.d/ before starting nginx, so ${PORT} is substituted.
CMD ["nginx", "-g", "daemon off;"]
