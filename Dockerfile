# syntax=docker/dockerfile:1

# ---- base: install dependencies -------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---- dev: vite dev server with HMR -----------------------------------------
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: produce static bundle ------------------------------------------
FROM base AS build
COPY . .
RUN npm run build

# ---- prod: static files behind nginx ---------------------------------------
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
