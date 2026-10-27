# syntax=docker/dockerfile:1

# ---------- Estágio 1: build ----------
# Mesma versão de Node usada no pipeline de CI, garantindo builds reprodutíveis.
FROM node:26-alpine AS build
WORKDIR /app

# Copia apenas os manifestos primeiro para aproveitar o cache de camadas do Docker.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
ARG GIT_SHA=docker
ENV GITHUB_SHA=${GIT_SHA} \
    BASE_PATH=/
RUN npm run build

# ---------- Estágio 2: runtime ----------
# Nginx sem privilégios de root (escuta na porta 8080). A imagem final não contém Node,
# código-fonte nem node_modules — somente o artefato estático (dist/).
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

# Atualiza os pacotes do Alpine (a imagem base pode atrasar correções de segurança)
# e remove o curl, que a aplicação não usa (o HEALTHCHECK usa o wget do BusyBox).
USER root
RUN apk upgrade --no-cache \
 && (apk del --no-cache curl || true)

LABEL org.opencontainers.image.title="SimulaFácil" \
      org.opencontainers.image.description="SPA de simuladores financeiros" \
      org.opencontainers.image.licenses="MIT"

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
USER 101

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
