#!/bin/bash

# Script para hacer respaldos de la base de datos YAAVS v5
# Ejecutar como: sudo ./backup-db.sh

set -e

echo "💾 Iniciando respaldo de base de datos..."

# Variables de configuración
DB_NAME="yaavs_db"
DB_USER="yaavs_user"
BACKUP_DIR="/opt/yaavs-v5/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="yaavs_backup_$DATE.sql"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root (sudo)"
    exit 1
fi

# Crear directorio de respaldos si no existe
mkdir -p $BACKUP_DIR

print_status "Creando respaldo de la base de datos..."
sudo -u postgres pg_dump -U postgres $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# Comprimir el respaldo
print_status "Comprimiendo respaldo..."
gzip $BACKUP_DIR/$BACKUP_FILE

print_status "Respaldo completado: $BACKUP_DIR/$BACKUP_FILE.gz"

# Limpiar respaldos antiguos (mantener solo los últimos 7 días)
print_status "Limpiando respaldos antiguos..."
find $BACKUP_DIR -name "yaavs_backup_*.sql.gz" -mtime +7 -delete

print_status "Respaldo completado exitosamente! 🎉" 