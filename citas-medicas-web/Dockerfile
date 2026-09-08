# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Front del SaaS Mini-ERP (Angular sobre Atomic-UI) servido por nginx.
# Etapa 1: build reproducible con la misma versión de Node del repo (.nvmrc).
# Etapa 2: nginx sirve la SPA y hace de proxy de /api y /Authentication hacia el
# chasis (webapi), de modo que el navegador ve un solo origen (sin CORS).
# ---------------------------------------------------------------------------

FROM node:24.15.0-alpine AS build
WORKDIR /app

# Instalación determinista desde el lockfile (capa cacheable).
COPY package.json package-lock.json ./
RUN npm ci

# Código y build de producción (salida en dist/saas-admin-front/browser).
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Config propia (SPA fallback + proxy al backend). Reemplaza la default.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Artefactos estáticos de la SPA.
COPY --from=build /app/dist/saas-admin-front/browser /usr/share/nginx/html

# Puerto no privilegiado, coherente con el resto del stack.
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=6 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
