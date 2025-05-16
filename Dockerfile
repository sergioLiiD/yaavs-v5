# Etapa de desarrollo
FROM node:20-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto de los archivos
COPY . .

# Configurar variables de entorno
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generar el cliente Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 