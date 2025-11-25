#!/bin/bash

# Script para hacer respaldos de la base de datos YAAVS v5 en Docker
# Ejecutar desde el directorio del proyecto donde está docker-compose.yml

set -e

echo "💾 Iniciando respaldo de base de datos (Docker)..."

# Variables de configuración
DB_NAME="yaavs_db"
DB_USER="postgres"
CONTAINER_NAME="yaavs_postgres"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="yaavs_backup_pre_migracion_$DATE.sql"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
}

# Verificar que Docker esté corriendo
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado o no está en el PATH"
    exit 1
fi

# Verificar que el contenedor existe y está corriendo
print_step "1. Verificando que el contenedor de PostgreSQL esté corriendo..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    print_error "El contenedor '$CONTAINER_NAME' no está corriendo"
    print_warning "Intenta iniciarlo con: docker-compose up -d postgres"
    exit 1
fi

CONTAINER_ID=$(docker ps -q -f name=$CONTAINER_NAME)
print_status "Contenedor encontrado: $CONTAINER_ID"

# Verificar que PostgreSQL esté listo
print_step "2. Verificando que PostgreSQL esté listo..."
if ! docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
    print_error "PostgreSQL no está respondiendo en el contenedor"
    print_warning "Revisa los logs con: docker logs $CONTAINER_NAME"
    exit 1
fi
print_status "PostgreSQL está listo"

# Crear directorio de respaldos si no existe
print_step "3. Creando directorio de respaldos..."
mkdir -p "$BACKUP_DIR"
print_status "Directorio: $BACKUP_DIR"

# Crear el backup
print_step "4. Creando respaldo de la base de datos..."
print_status "Esto puede tomar unos minutos dependiendo del tamaño de la BD..."

if docker exec $CONTAINER_NAME pg_dump -U $DB_USER -F p -v $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE" 2>&1; then
    # Verificar que el archivo se creó y tiene contenido
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
        FILE_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
        print_status "✅ Backup creado exitosamente!"
        print_status "   Archivo: $BACKUP_DIR/$BACKUP_FILE"
        print_status "   Tamaño: $FILE_SIZE"
    else
        print_error "El archivo de backup se creó pero está vacío o no existe"
        exit 1
    fi
else
    print_error "Error al crear el backup"
    exit 1
fi

# Verificar integridad del backup (básico)
print_step "5. Verificando integridad del backup..."
if grep -q "PostgreSQL database dump" "$BACKUP_DIR/$BACKUP_FILE"; then
    print_status "✅ El backup parece ser válido (contiene encabezado de PostgreSQL)"
else
    print_warning "⚠️ El backup podría no ser válido (no contiene encabezado esperado)"
fi

# Contar tablas en el backup
TABLE_COUNT=$(grep -c "^CREATE TABLE" "$BACKUP_DIR/$BACKUP_FILE" || echo "0")
print_status "   Tablas encontradas en backup: $TABLE_COUNT"

# Comprimir el backup
print_step "6. Comprimiendo respaldo..."
if command -v gzip &> /dev/null; then
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    BACKUP_FILE_FINAL="$BACKUP_FILE.gz"
    FILE_SIZE_COMPRESSED=$(du -h "$BACKUP_DIR/$BACKUP_FILE_FINAL" | cut -f1)
    print_status "✅ Backup comprimido: $BACKUP_FILE_FINAL"
    print_status "   Tamaño comprimido: $FILE_SIZE_COMPRESSED"
else
    print_warning "gzip no disponible, backup sin comprimir"
    BACKUP_FILE_FINAL="$BACKUP_FILE"
fi

# Mostrar información final
echo ""
print_status "════════════════════════════════════════════════════════════"
print_status "✅ Respaldo completado exitosamente!"
print_status "════════════════════════════════════════════════════════════"
print_status "Archivo: $BACKUP_DIR/$BACKUP_FILE_FINAL"
print_status "Fecha: $(date)"
print_status ""
print_status "Para restaurar este backup:"
print_status "  docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME < $BACKUP_DIR/$BACKUP_FILE_FINAL"
print_status "════════════════════════════════════════════════════════════"

