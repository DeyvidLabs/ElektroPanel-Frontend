# ===== Base =====
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ===== Development =====
FROM base AS dev
RUN npm install --force
COPY . .
EXPOSE 4600
CMD ["npm", "run", "start"]

# ===== Production build =====
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# ===== Nginx serve =====
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY ../nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 2083
CMD ["nginx", "-g", "daemon off;"]