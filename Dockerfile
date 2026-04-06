# Stage 1: Build Image
FROM node:20-alpine AS builder

WORKDIR /app

# Archivos de pacman/npm
COPY package.json package-lock.json ./

# Carga limpia
RUN npm ci

# Copia código de fuente
COPY . .

# Compila para producción /dist
RUN npm run build

# Stage 2: Producción Server Nginx
FROM nginx:alpine

# Limpia el dir de de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia desde estage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia archivo config SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
