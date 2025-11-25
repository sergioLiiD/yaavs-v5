#!/bin/bash

# Script para aplicar la migración de forma segura
# Ejecutar desde el directorio del proyecto

set -e

echo "🔧 Aplicando migración: Agregar soporte para pagos de ventas"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que el contenedor esté corriendo
print_status "1. Verificando que el contenedor de la app esté corriendo..."
if ! docker ps | grep -q "yaavs_app"; then
    print_error "El contenedor yaavs_app no está corriendo"
    exit 1
fi
print_status "✅ Contenedor encontrado"

# Verificar que PostgreSQL esté listo
print_status "2. Verificando que PostgreSQL esté listo..."
if ! docker exec yaavs_postgres pg_isready -U postgres -d yaavs_db > /dev/null 2>&1; then
    print_error "PostgreSQL no está respondiendo"
    exit 1
fi
print_status "✅ PostgreSQL está listo"

# Generar cliente de Prisma
print_status "3. Generando cliente de Prisma..."
if docker exec yaavs_app npx prisma generate; then
    print_status "✅ Cliente de Prisma generado"
else
    print_error "Error al generar cliente de Prisma"
    exit 1
fi

# Aplicar migración
print_status "4. Aplicando migración..."
print_warning "   Esto puede tomar unos segundos..."
if docker exec yaavs_app npx prisma migrate deploy; then
    print_status "✅ Migración aplicada exitosamente"
else
    print_error "Error al aplicar la migración"
    print_warning "Revisa los logs con: docker logs yaavs_app"
    exit 1
fi

echo ""
print_status "════════════════════════════════════════════════════════════"
print_status "✅ Migración completada exitosamente!"
print_status "════════════════════════════════════════════════════════════"
print_status ""
print_status "La tabla 'pagos' ahora puede relacionarse con 'ventas'."
print_status "Puedes continuar con la actualización del código."
print_status "════════════════════════════════════════════════════════════"

