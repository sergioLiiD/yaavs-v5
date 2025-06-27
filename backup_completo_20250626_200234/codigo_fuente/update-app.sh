#!/bin/bash

# Script para actualizar la aplicación YAAVS v5
# Ejecutar como: sudo ./update-app.sh

set -e

echo "🔄 Iniciando actualización de YAAVS v5..."

# Variables de configuración
APP_NAME="yaavs-v5"
APP_USER="yaavs"
APP_DIR="/opt/$APP_NAME"

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

# Hacer respaldo antes de actualizar
print_status "Haciendo respaldo de la base de datos..."
./backup-db.sh

# Detener la aplicación
print_status "Deteniendo la aplicación..."
pm2 stop yaavs-v5

# Cambiar al usuario de la aplicación
print_status "Actualizando aplicación como usuario $APP_USER..."
su - $APP_USER << 'EOF'
cd /opt/yaavs-v5

# Actualizar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Construir la aplicación
npm run build
EOF

# Reiniciar la aplicación
print_status "Reiniciando la aplicación..."
pm2 restart yaavs-v5

print_status "Actualización completada!"
print_status "La aplicación debería estar disponible en: http://187.189.131.119"
print_status "Para verificar el estado: pm2 status"
print_status "Para ver logs: pm2 logs yaavs-v5" 