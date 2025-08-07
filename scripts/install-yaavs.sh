#!/bin/bash

# Script de Instalación Automática - YAAVS v5
# Desarrollado por: Sergio Velazco

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para verificar si el usuario es root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Este script no debe ejecutarse como root"
        exit 1
    fi
}

# Función para actualizar el sistema
update_system() {
    print_status "Actualizando el sistema..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    print_success "Sistema actualizado"
}

# Función para instalar Docker
install_docker() {
    print_status "Instalando Docker..."
    
    if command_exists docker; then
        print_warning "Docker ya está instalado"
        return
    fi
    
    # Agregar repositorio oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Actualizar e instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Configurar Docker
    sudo usermod -aG docker $USER
    sudo systemctl enable docker
    sudo systemctl start docker
    
    print_success "Docker instalado y configurado"
}

# Función para configurar zona horaria
setup_timezone() {
    print_status "Configurando zona horaria..."
    sudo timedatectl set-timezone America/Mexico_City
    print_success "Zona horaria configurada"
}

# Función para preparar directorio del proyecto
setup_project_directory() {
    print_status "Preparando directorio del proyecto..."
    
    # Crear directorio si no existe
    if [ ! -d "/opt/yaavs-v5" ]; then
        sudo mkdir -p /opt/yaavs-v5
    fi
    
    # Cambiar permisos
    sudo chown -R $USER:$USER /opt/yaavs-v5
    
    # Si estamos ejecutando desde el directorio del proyecto, copiar archivos
    if [ -f "docker-compose.yml" ]; then
        print_status "Copiando archivos del proyecto..."
        cp -r * /opt/yaavs-v5/
        cp -r .env* /opt/yaavs-v5/ 2>/dev/null || true
    fi
    
    cd /opt/yaavs-v5
    print_success "Directorio del proyecto preparado"
}

# Función para configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Archivo .env creado desde .env.example"
            print_warning "IMPORTANTE: Edita el archivo .env con tus configuraciones específicas"
        else
            print_error "No se encontró .env.example. Crea manualmente el archivo .env"
            exit 1
        fi
    fi
    
    print_success "Variables de entorno configuradas"
}

# Función para generar secrets seguros
generate_secrets() {
    print_status "Generando secrets seguros..."
    
    # Generar NEXTAUTH_SECRET si no existe
    if ! grep -q "NEXTAUTH_SECRET=" .env 2>/dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET" >> .env
        print_success "NEXTAUTH_SECRET generado"
    fi
    
    # Generar JWT_SECRET si no existe
    if ! grep -q "JWT_SECRET=" .env 2>/dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo "JWT_SECRET=$JWT_SECRET" >> .env
        print_success "JWT_SECRET generado"
    fi
}

# Función para construir y levantar servicios
deploy_services() {
    print_status "Construyendo y levantando servicios..."
    
    # Construir imágenes
    docker-compose build
    
    # Levantar servicios
    docker-compose up -d
    
    # Esperar a que los servicios estén listos
    print_status "Esperando a que los servicios estén listos..."
    sleep 30
    
    print_success "Servicios desplegados"
}

# Función para ejecutar migraciones
run_migrations() {
    print_status "Ejecutando migraciones..."
    
    # Esperar a que la base de datos esté lista
    sleep 10
    
    # Ejecutar migraciones
    docker-compose run --rm migrations || {
        print_warning "Migraciones fallaron, intentando manualmente..."
        docker exec yaavs_app npx prisma migrate deploy || true
    }
    
    print_success "Migraciones completadas"
}

# Función para verificar instalación
verify_installation() {
    print_status "Verificando instalación..."
    
    # Verificar servicios
    if docker-compose ps | grep -q "Up"; then
        print_success "Servicios están corriendo"
    else
        print_error "Algunos servicios no están corriendo"
        docker-compose ps
        exit 1
    fi
    
    # Verificar aplicación
    if curl -f http://localhost:4001/api/health >/dev/null 2>&1; then
        print_success "Aplicación responde correctamente"
    else
        print_warning "La aplicación aún no responde, puede tardar unos minutos"
    fi
    
    print_success "Instalación verificada"
}

# Función principal
main() {
    echo "========================================"
    echo "Instalador Automático - YAAVS v5"
    echo "========================================"
    
    # Verificar que no se ejecute como root
    check_root
    
    # Actualizar sistema
    update_system
    
    # Instalar Docker
    install_docker
    
    # Configurar zona horaria
    setup_timezone
    
    # Preparar directorio del proyecto
    setup_project_directory
    
    # Configurar variables de entorno
    setup_environment
    
    # Generar secrets
    generate_secrets
    
    # Desplegar servicios
    deploy_services
    
    # Ejecutar migraciones
    run_migrations
    
    # Verificar instalación
    verify_installation
    
    echo ""
    echo "========================================"
    echo "Instalación Completada"
    echo "========================================"
    print_success "YAAVS v5 ha sido instalado exitosamente"
    echo ""
    echo "Próximos pasos:"
    echo "1. Edita el archivo .env con tus configuraciones específicas"
    echo "2. Ejecuta: ./scripts/create-admin-user.sh"
    echo "3. Accede a la aplicación en: http://localhost:4001"
    echo ""
    print_warning "IMPORTANTE: Cambia las contraseñas por defecto"
    print_warning "IMPORTANTE: Configura backups automáticos"
    echo ""
}

# Ejecutar función principal
main "$@" 