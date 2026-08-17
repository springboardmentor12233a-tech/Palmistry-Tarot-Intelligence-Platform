FROM node:22-bookworm-slim AS build


# ========================================================
# WORKING DIRECTORY
# ========================================================

WORKDIR /app


# ========================================================
# INSTALL FRONTEND DEPENDENCIES
# ========================================================

COPY package.json package-lock.json ./

RUN npm ci


# ========================================================
# COPY FRONTEND SOURCE
# ========================================================

COPY . .


# ========================================================
# VITE BUILD-TIME CONFIGURATION
# ========================================================
#
# Render exposes configured environment variables as
# Docker build arguments.
#
# These values are compiled into the Vite frontend.
# ========================================================

ARG VITE_API_BASE_URL=http://127.0.0.1:8000

ARG VITE_GOOGLE_CLIENT_ID=""


ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}


# ========================================================
# PRODUCTION BUILD
# ========================================================

RUN npm run build


# ========================================================
# NGINX PRODUCTION IMAGE
# ========================================================

FROM nginx:alpine


COPY nginx.conf \
    /etc/nginx/conf.d/default.conf


COPY --from=build \
    /app/dist \
    /usr/share/nginx/html


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]