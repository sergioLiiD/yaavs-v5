#!/bin/bash

# Script para ejecutar migraciones de Prisma en producción
# Uso: ./scripts/run-migration-prod.sh

set -e

echo "🚀 Ejecutando migración de Prisma en producción..."

# Verificar que Docker Compose esté corriendo
if ! docker ps | grep -q "yaavs_postgres_prod"; then
    echo "❌ Error: El contenedor de PostgreSQL no está corriendo"
    echo "Por favor, inicia los servicios con: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Ejecutar la migración dentro del contenedor de la aplicación
echo "📦 Ejecutando migración dentro del contenedor..."
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

echo "✅ Migración completada exitosamente!"

# Verificar el estado de la migración
echo "🔍 Verificando estado de la base de datos..."
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate status

echo "🎉 ¡Migración completada! Las nuevas tablas de ventas están listas." 