#!/bin/bash

# Script para configurar la aplicación YAAVS v5 después del despliegue base
# Ejecutar como: sudo ./setup-app.sh

set -e

echo "🔧 Configurando aplicación YAAVS v5..."

# Variables de configuración
APP_NAME="yaavs-v5"
APP_USER="yaavs"
APP_DIR="/opt/$APP_NAME"
SERVICE_NAME="yaavs-v5"

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

# Crear directorio de logs
print_status "Creando directorio de logs..."
mkdir -p /var/log/yaavs-v5
chown $APP_USER:$APP_USER /var/log/yaavs-v5

# Configurar Nginx
print_status "Configurando Nginx..."
cp nginx.conf /etc/nginx/sites-available/yaavs-v5
ln -sf /etc/nginx/sites-available/yaavs-v5 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Cambiar al usuario de la aplicación
print_status "Configurando aplicación como usuario $APP_USER..."
su - $APP_USER << 'EOF'
cd /opt/yaavs-v5

# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Construir la aplicación
npm run build

# Configurar PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
EOF

print_status "Configuración completada!"
print_status "La aplicación debería estar disponible en: http://187.189.131.119"
print_status "Para verificar el estado: pm2 status"
print_status "Para ver logs: pm2 logs yaavs-v5" 