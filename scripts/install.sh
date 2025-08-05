#!/bin/bash

# Script de Instalación Automatizada - YAAVS v5
# Desarrollado por: Sergio Velazco
# Versión: 1.0

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar si se ejecuta como root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Este script no debe ejecutarse como root"
        exit 1
    fi
}

# Verificar sistema operativo
check_os() {
    print_header "Verificando Sistema Operativo"
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "No se pudo detectar el sistema operativo"
        exit 1
    fi
    
    print_message "Sistema Operativo: $OS $VER"
    
    # Verificar que sea Ubuntu/Debian
    if [[ "$OS" != *"Ubuntu"* ]] && [[ "$OS" != *"Debian"* ]]; then
        print_warning "Este script está optimizado para Ubuntu/Debian. Otros sistemas pueden requerir ajustes."
    fi
}

# Actualizar sistema
update_system() {
    print_header "Actualizando Sistema"
    
    sudo apt update
    sudo apt upgrade -y
    
    # Instalar paquetes básicos
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    print_message "Sistema actualizado correctamente"
}

# Instalar Docker
install_docker() {
    print_header "Instalando Docker"
    
    # Verificar si Docker ya está instalado
    if command -v docker &> /dev/null; then
        print_message "Docker ya está instalado"
        docker --version
        return
    fi
    
    # Agregar repositorio oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Actualizar e instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Agregar usuario al grupo docker
    sudo usermod -aG docker $USER
    
    # Habilitar Docker en el arranque
    sudo systemctl enable docker
    sudo systemctl start docker
    
    print_message "Docker instalado correctamente"
    docker --version
}

# Instalar Docker Compose (si no está incluido)
install_docker_compose() {
    print_header "Verificando Docker Compose"
    
    if command -v docker-compose &> /dev/null; then
        print_message "Docker Compose ya está instalado"
        docker-compose --version
        return
    fi
    
    # Descargar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Dar permisos de ejecución
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_message "Docker Compose instalado correctamente"
    docker-compose --version
}

# Clonar repositorio
clone_repository() {
    print_header "Clonando Repositorio"
    
    # Verificar si ya existe el directorio
    if [ -d "/opt/yaavs-v5" ]; then
        print_warning "El directorio /opt/yaavs-v5 ya existe"
        read -p "¿Deseas sobrescribir? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo rm -rf /opt/yaavs-v5
        else
            print_message "Usando instalación existente"
            return
        fi
    fi
    
    # Crear directorio y clonar
    sudo mkdir -p /opt
    cd /opt
    sudo git clone https://github.com/sergioLiiD/yaavs-v5.git
    sudo chown -R $USER:$USER yaavs-v5
    cd yaavs-v5
    
    print_message "Repositorio clonado correctamente"
}

# Configurar variables de entorno
setup_environment() {
    print_header "Configurando Variables de Entorno"
    
    # Crear archivo .env si no existe
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_message "Archivo .env creado desde .env.example"
        else
            print_error "No se encontró .env.example"
            exit 1
        fi
    fi
    
    # Generar secrets si no están configurados
    if ! grep -q "NEXTAUTH_SECRET=" .env || grep -q "NEXTAUTH_SECRET=your-secret" .env; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        sed -i "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=$NEXTAUTH_SECRET/" .env
        print_message "NEXTAUTH_SECRET generado automáticamente"
    fi
    
    if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=your-jwt-secret" .env; then
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        print_message "JWT_SECRET generado automáticamente"
    fi
    
    print_warning "IMPORTANTE: Revisa y configura el archivo .env con tus valores específicos"
    print_message "Puedes editar el archivo con: nano .env"
}

# Configurar Docker Compose
setup_docker_compose() {
    print_header "Configurando Docker Compose"
    
    # Verificar que existe el archivo
    if [ ! -f "docker-compose.yml" ]; then
        print_error "No se encontró docker-compose.yml"
        exit 1
    fi
    
    print_warning "IMPORTANTE: Revisa y configura docker-compose.yml con tus puertos y configuración específica"
    print_message "Puedes editar el archivo con: nano docker-compose.yml"
}

# Crear directorios necesarios
create_directories() {
    print_header "Creando Directorios Necesarios"
    
    # Crear directorios para logs y backups
    mkdir -p logs
    mkdir -p backups
    mkdir -p public/uploads
    
    print_message "Directorios creados correctamente"
}

# Construir y levantar servicios
deploy_services() {
    print_header "Desplegando Servicios"
    
    # Construir imágenes
    print_message "Construyendo imágenes Docker..."
    docker-compose build
    
    # Levantar servicios
    print_message "Levantando servicios..."
    docker-compose up -d
    
    # Verificar estado
    print_message "Verificando estado de servicios..."
    docker-compose ps
    
    print_message "Servicios desplegados correctamente"
}

# Verificar instalación
verify_installation() {
    print_header "Verificando Instalación"
    
    # Verificar que los contenedores estén corriendo
    if docker-compose ps | grep -q "Up"; then
        print_message "Contenedores están corriendo"
    else
        print_error "Algunos contenedores no están corriendo"
        docker-compose ps
        exit 1
    fi
    
    # Verificar conectividad de la aplicación
    sleep 10  # Esperar a que la aplicación esté lista
    if curl -f http://localhost:4001/api/health &> /dev/null; then
        print_message "Aplicación responde correctamente"
    else
        print_warning "La aplicación no responde aún, puede tardar unos minutos en iniciar"
    fi
    
    # Verificar base de datos
    if docker exec yaavs_postgres pg_isready -U postgres &> /dev/null; then
        print_message "Base de datos está funcionando"
    else
        print_error "Base de datos no está funcionando"
        exit 1
    fi
}

# Mostrar información final
show_final_info() {
    print_header "Instalación Completada"
    
    echo -e "${GREEN}¡Instalación completada exitosamente!${NC}"
    echo
    echo "Información importante:"
    echo "- URL de la aplicación: http://localhost:4001"
    echo "- Base de datos PostgreSQL: localhost:5432"
    echo "- Logs de la aplicación: docker-compose logs -f app"
    echo "- Logs de la base de datos: docker-compose logs -f postgres"
    echo
    echo "Comandos útiles:"
    echo "- Ver estado: docker-compose ps"
    echo "- Reiniciar: docker-compose restart"
    echo "- Detener: docker-compose down"
    echo "- Actualizar: git pull && docker-compose up -d --build"
    echo
    print_warning "IMPORTANTE: Configura SSL y dominio antes de usar en producción"
    print_warning "Revisa el archivo .env y configura tus variables específicas"
}

# Función principal
main() {
    print_header "Instalador Automatizado - YAAVS v5"
    
    check_root
    check_os
    update_system
    install_docker
    install_docker_compose
    clone_repository
    setup_environment
    setup_docker_compose
    create_directories
    deploy_services
    verify_installation
    show_final_info
}

# Ejecutar función principal
main "$@" 