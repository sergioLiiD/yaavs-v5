#!/bin/bash

# Script de despliegue para YAAVS v5 en Ubuntu
# Ejecutar como: sudo ./deploy.sh

set -e

echo "🚀 Iniciando despliegue de YAAVS v5..."

# Variables de configuración
APP_NAME="yaavs-v5"
APP_USER="yaavs"
APP_DIR="/opt/$APP_NAME"
SERVICE_NAME="yaavs-v5"
DB_NAME="yaavs_db"
DB_USER="yaavs_user"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
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

print_status "Actualizando sistema..."
apt update && apt upgrade -y

print_status "Instalando dependencias del sistema..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Node.js 18.x
print_status "Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verificar versiones
print_status "Verificando versiones instaladas..."
node --version
npm --version

# Instalar PostgreSQL
print_status "Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Iniciar y habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Instalar PM2 para gestión de procesos
print_status "Instalando PM2..."
npm install -g pm2

# Instalar Nginx
print_status "Instalando Nginx..."
apt install -y nginx

# Crear usuario para la aplicación
print_status "Creando usuario para la aplicación..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d $APP_DIR $APP_USER
else
    print_warning "El usuario $APP_USER ya existe"
fi

# Crear directorio de la aplicación
print_status "Creando directorio de la aplicación..."
mkdir -p $APP_DIR
chown $APP_USER:$APP_USER $APP_DIR

# Configurar PostgreSQL
print_status "Configurando PostgreSQL..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD 'yaavs_password_2024';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# Configurar firewall
print_status "Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000
ufw --force enable

print_status "Despliegue base completado!"
print_status "Próximos pasos:"
echo "1. Copiar los archivos de la aplicación a $APP_DIR"
echo "2. Configurar variables de entorno en $APP_DIR/.env"
echo "3. Ejecutar: cd $APP_DIR && npm install"
echo "4. Ejecutar: npm run build"
echo "5. Configurar Nginx"
echo "6. Iniciar la aplicación con PM2"

print_status "Script de despliegue completado exitosamente! 🎉" 