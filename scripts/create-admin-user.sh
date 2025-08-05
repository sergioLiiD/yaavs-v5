#!/bin/bash

# Script para Crear Usuario Administrador - YAAVS v5
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

# Función para validar email
validate_email() {
    local email=$1
    if [[ $email =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Función para validar contraseña
validate_password() {
    local password=$1
    # Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
    if [[ ${#password} -ge 8 && $password =~ [A-Z] && $password =~ [a-z] && $password =~ [0-9] ]]; then
        return 0
    else
        return 1
    fi
}

# Función para generar contraseña segura
generate_secure_password() {
    # Generar contraseña con caracteres especiales
    openssl rand -base64 12 | tr -d "=+/" | cut -c1-12
}

# Función para crear usuario administrador
create_admin_user() {
    print_header "Crear Usuario Administrador - YAAVS v5"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "docker-compose.yml" ]; then
        print_error "No se encontró docker-compose.yml. Ejecuta este script desde el directorio raíz del proyecto."
        exit 1
    fi
    
    # Verificar que Docker esté corriendo
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está corriendo. Inicia Docker primero."
        exit 1
    fi
    
    # Verificar que los contenedores estén corriendo
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Los contenedores no están corriendo. Inicia los servicios primero con: docker-compose up -d"
        exit 1
    fi
    
    print_message "Verificando conexión a la base de datos..."
    
    # Verificar conexión a la base de datos
    if ! docker exec yaavs_postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "No se puede conectar a la base de datos. Verifica que PostgreSQL esté corriendo."
        exit 1
    fi
    
    print_message "Conexión a la base de datos exitosa"
    
    # Solicitar información del usuario
    echo
    print_message "Ingresa la información del usuario administrador:"
    echo
    
    # Email
    while true; do
        read -p "Email del administrador: " email
        if validate_email "$email"; then
            break
        else
            print_error "Email inválido. Intenta de nuevo."
        fi
    done
    
    # Nombre
    read -p "Nombre: " nombre
    if [ -z "$nombre" ]; then
        print_error "El nombre no puede estar vacío."
        exit 1
    fi
    
    # Apellido paterno
    read -p "Apellido paterno: " apellido_paterno
    if [ -z "$apellido_paterno" ]; then
        print_error "El apellido paterno no puede estar vacío."
        exit 1
    fi
    
    # Apellido materno (opcional)
    read -p "Apellido materno (opcional): " apellido_materno
    
    # Teléfono (opcional)
    read -p "Teléfono (opcional): " telefono
    
    # Contraseña
    echo
    print_warning "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número."
    read -s -p "Contraseña: " password
    echo
    
    if [ -z "$password" ]; then
        print_message "Generando contraseña segura automáticamente..."
        password=$(generate_secure_password)
        print_message "Contraseña generada: $password"
    elif ! validate_password "$password"; then
        print_error "La contraseña no cumple con los requisitos de seguridad."
        exit 1
    fi
    
    # Confirmar contraseña
    read -s -p "Confirmar contraseña: " password_confirm
    echo
    
    if [ "$password" != "$password_confirm" ]; then
        print_error "Las contraseñas no coinciden."
        exit 1
    fi
    
    # Verificar si el usuario ya existe
    print_message "Verificando si el usuario ya existe..."
    
    existing_user=$(docker exec yaavs_postgres psql -U postgres -d yaavs_db -t -c "SELECT id FROM usuarios WHERE email = '$email';" 2>/dev/null | tr -d ' ')
    
    if [ ! -z "$existing_user" ]; then
        print_warning "El usuario con email '$email' ya existe."
        read -p "¿Deseas actualizar el usuario existente? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_message "Actualizando usuario existente..."
            update_existing_user "$email" "$nombre" "$apellido_paterno" "$apellido_materno" "$telefono" "$password"
        else
            print_message "Operación cancelada."
            exit 0
        fi
    else
        print_message "Creando nuevo usuario administrador..."
        create_new_user "$email" "$nombre" "$apellido_paterno" "$apellido_materno" "$telefono" "$password"
    fi
}

# Función para crear nuevo usuario
create_new_user() {
    local email=$1
    local nombre=$2
    local apellido_paterno=$3
    local apellido_materno=$4
    local telefono=$5
    local password=$6
    
    # Generar hash de la contraseña usando bcrypt
    print_message "Generando hash de la contraseña..."
    
    # Crear script temporal para generar hash
    cat > /tmp/generate_hash.js << EOF
const bcrypt = require('bcryptjs');

async function generateHash() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('$password', salt);
    console.log(hash);
}

generateHash();
EOF
    
    # Ejecutar script para generar hash
    password_hash=$(docker exec yaavs_app node /tmp/generate_hash.js 2>/dev/null)
    
    if [ -z "$password_hash" ]; then
        print_error "Error al generar hash de la contraseña."
        exit 1
    fi
    
    # Preparar valores para SQL
    apellido_materno_sql=${apellido_materno:-null}
    telefono_sql=${telefono:-null}
    
    # Crear usuario en la base de datos
    print_message "Creando usuario en la base de datos..."
    
    sql_command="INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password_hash, telefono, activo, created_at, updated_at) VALUES ('$nombre', '$apellido_paterno', $apellido_materno_sql, '$email', '$password_hash', $telefono_sql, true, NOW(), NOW());"
    
    if docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "$sql_command" > /dev/null 2>&1; then
        print_message "Usuario creado exitosamente en la base de datos."
    else
        print_error "Error al crear usuario en la base de datos."
        exit 1
    fi
    
    # Obtener ID del usuario creado
    user_id=$(docker exec yaavs_postgres psql -U postgres -d yaavs_db -t -c "SELECT id FROM usuarios WHERE email = '$email';" | tr -d ' ')
    
    # Crear rol de administrador si no existe
    print_message "Configurando rol de administrador..."
    
    # Verificar si existe el rol ADMIN
    admin_role_id=$(docker exec yaavs_postgres psql -U postgres -d yaavs_db -t -c "SELECT id FROM roles WHERE nombre = 'ADMIN';" | tr -d ' ')
    
    if [ -z "$admin_role_id" ]; then
        print_message "Creando rol ADMIN..."
        docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "INSERT INTO roles (nombre, descripcion, created_at, updated_at) VALUES ('ADMIN', 'Administrador del sistema', NOW(), NOW());" > /dev/null 2>&1
        admin_role_id=$(docker exec yaavs_postgres psql -U postgres -d yaavs_db -t -c "SELECT id FROM roles WHERE nombre = 'ADMIN';" | tr -d ' ')
    fi
    
    # Asignar rol de administrador al usuario
    print_message "Asignando rol de administrador al usuario..."
    
    role_assignment_sql="INSERT INTO usuarios_roles (usuario_id, rol_id, created_at, updated_at) VALUES ($user_id, $admin_role_id, NOW(), NOW());"
    
    if docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "$role_assignment_sql" > /dev/null 2>&1; then
        print_message "Rol de administrador asignado exitosamente."
    else
        print_warning "El usuario ya tiene el rol de administrador asignado."
    fi
    
    # Limpiar archivo temporal
    rm -f /tmp/generate_hash.js
    
    # Mostrar información del usuario creado
    show_user_info "$email" "$password"
}

# Función para actualizar usuario existente
update_existing_user() {
    local email=$1
    local nombre=$2
    local apellido_paterno=$3
    local apellido_materno=$4
    local telefono=$5
    local password=$6
    
    # Generar hash de la contraseña
    print_message "Generando nuevo hash de la contraseña..."
    
    cat > /tmp/generate_hash.js << EOF
const bcrypt = require('bcryptjs');

async function generateHash() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('$password', salt);
    console.log(hash);
}

generateHash();
EOF
    
    password_hash=$(docker exec yaavs_app node /tmp/generate_hash.js 2>/dev/null)
    
    if [ -z "$password_hash" ]; then
        print_error "Error al generar hash de la contraseña."
        exit 1
    fi
    
    # Preparar valores para SQL
    apellido_materno_sql=${apellido_materno:-null}
    telefono_sql=${telefono:-null}
    
    # Actualizar usuario
    print_message "Actualizando información del usuario..."
    
    update_sql="UPDATE usuarios SET nombre = '$nombre', apellido_paterno = '$apellido_paterno', apellido_materno = $apellido_materno_sql, password_hash = '$password_hash', telefono = $telefono_sql, updated_at = NOW() WHERE email = '$email';"
    
    if docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "$update_sql" > /dev/null 2>&1; then
        print_message "Usuario actualizado exitosamente."
    else
        print_error "Error al actualizar usuario."
        exit 1
    fi
    
    # Limpiar archivo temporal
    rm -f /tmp/generate_hash.js
    
    # Mostrar información del usuario actualizado
    show_user_info "$email" "$password"
}

# Función para mostrar información del usuario
show_user_info() {
    local email=$1
    local password=$2
    
    print_header "Usuario Administrador Creado/Actualizado"
    
    echo -e "${GREEN}✅ Usuario configurado exitosamente${NC}"
    echo
    echo "Información del usuario:"
    echo "- Email: $email"
    echo "- Contraseña: $password"
    echo "- Rol: Administrador"
    echo "- Estado: Activo"
    echo
    echo "Puedes acceder al sistema con estas credenciales."
    echo
    print_warning "IMPORTANTE: Guarda la contraseña en un lugar seguro."
    print_warning "Se recomienda cambiar la contraseña después del primer acceso."
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -q, --quick    Modo rápido (valores por defecto)"
    echo
    echo "Ejemplos:"
    echo "  $0              # Modo interactivo"
    echo "  $0 --quick      # Modo rápido"
    echo
    echo "Este script crea un usuario administrador en el sistema YAAVS v5."
}

# Función para modo rápido
quick_mode() {
    print_header "Modo Rápido - Crear Usuario Administrador"
    
    # Valores por defecto
    email="admin@yaavs.com"
    nombre="Administrador"
    apellido_paterno="Sistema"
    password=$(generate_secure_password)
    
    print_message "Usando valores por defecto:"
    echo "- Email: $email"
    echo "- Nombre: $nombre"
    echo "- Apellido: $apellido_paterno"
    echo "- Contraseña: $password"
    echo
    
    read -p "¿Continuar con estos valores? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_message "Ejecutando en modo interactivo..."
        create_admin_user
        return
    fi
    
    # Verificar si el usuario ya existe
    existing_user=$(docker exec yaavs_postgres psql -U postgres -d yaavs_db -t -c "SELECT id FROM usuarios WHERE email = '$email';" 2>/dev/null | tr -d ' ')
    
    if [ ! -z "$existing_user" ]; then
        print_warning "El usuario ya existe. Actualizando..."
        update_existing_user "$email" "$nombre" "$apellido_paterno" "" "" "$password"
    else
        print_message "Creando nuevo usuario..."
        create_new_user "$email" "$nombre" "$apellido_paterno" "" "" "$password"
    fi
}

# Función principal
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -q|--quick)
            quick_mode
            ;;
        "")
            create_admin_user
            ;;
        *)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 