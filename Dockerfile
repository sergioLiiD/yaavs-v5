# Usar imagen oficial de Node.js con Debian
FROM node:18.20.2-bullseye-slim AS base

# Instalar dependencias necesarias para Prisma y compilación
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    postgresql-client \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo Prisma)
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Generar Prisma Client usando el binario instalado (evita que npx instale otra versión)
RUN ./node_modules/.bin/prisma generate 2>/dev/null || npx --yes prisma@5.22.0 generate

# Etapa de construcción
FROM base AS builder

WORKDIR /app

# Instalar todas las dependencias (incluyendo dev)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Generar Prisma Client nuevamente usando el binario instalado
RUN ./node_modules/.bin/prisma generate 2>/dev/null || npx --yes prisma@5.22.0 generate

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18.20.2-bullseye-slim AS runner

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear usuario no privilegiado
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
# Crear directorio public
RUN mkdir -p ./public

# Copiar código fuente completo
COPY --from=builder /app/src ./src
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Copiar node_modules optimizado
COPY --from=base /app/node_modules ./node_modules

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no privilegiado
USER nextjs

# Exponer puerto
EXPOSE 3100

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3100

# Script de inicio
CMD ["npm", "start"] 