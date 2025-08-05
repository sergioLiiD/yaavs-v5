#!/bin/bash

# Script de Verificación para arregla.mx - YAAVS v5
# Desarrollado por: Sergio Velazco
# Versión: 1.0

set -e

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

# Función para verificar archivo
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${RED}❌${NC} $description - FALTANTE"
        return 1
    fi
}

# Función para verificar directorio
check_directory() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${RED}❌${NC} $description - FALTANTE"
        return 1
    fi
}

# Función principal de verificación
verify_arregla_mx() {
    print_header "Verificación de arregla.mx.tar.gz"
    
    # Verificar que el archivo existe
    if [ ! -f "arregla.mx.tar.gz" ]; then
        print_error "No se encontró el archivo arregla.mx.tar.gz"
        exit 1
    fi
    
    print_message "Archivo arregla.mx.tar.gz encontrado"
    
    # Mostrar información del archivo
    local file_size=$(ls -lh arregla.mx.tar.gz | awk '{print $5}')
    local file_date=$(ls -lh arregla.mx.tar.gz | awk '{print $6, $7, $8}')
    
    echo "📦 Tamaño: $file_size"
    echo "📅 Fecha: $file_date"
    echo
    
    # Crear directorio temporal para verificación
    local temp_dir="temp_verify_arregla_mx"
    mkdir -p "$temp_dir"
    
    print_message "Extrayendo archivo para verificación..."
    
    # Extraer archivo
    tar -xzf arregla.mx.tar.gz -C "$temp_dir"
    
    cd "$temp_dir"
    
    print_header "Verificación de Archivos Críticos"
    
    local missing_files=0
    
    # Verificar archivos de configuración Docker
    echo "🐳 Verificando configuración Docker..."
    check_file "Dockerfile" "Dockerfile" || ((missing_files++))
    check_file "docker-compose.yml" "docker-compose.yml" || ((missing_files++))
    check_file "docker-compose.example.yml" "docker-compose.example.yml" || ((missing_files++))
    check_file "docker-init.sh" "docker-init.sh" || ((missing_files++))
    
    # Verificar configuración del proyecto
    echo
    echo "⚙️ Verificando configuración del proyecto..."
    check_file "package.json" "package.json" || ((missing_files++))
    check_file "tsconfig.json" "tsconfig.json" || ((missing_files++))
    check_file "tailwind.config.js" "tailwind.config.js" || ((missing_files++))
    check_file "next.config.js" "next.config.js" || ((missing_files++))
    
    # Verificar base de datos
    echo
    echo "🗄️ Verificando configuración de base de datos..."
    check_file "prisma/schema.prisma" "prisma/schema.prisma" || ((missing_files++))
    check_directory "prisma/migrations" "prisma/migrations" || ((missing_files++))
    check_file "prisma/seed.ts" "prisma/seed.ts" || ((missing_files++))
    
    # Verificar código fuente
    echo
    echo "🏗️ Verificando código fuente..."
    check_directory "src" "src" || ((missing_files++))
    check_directory "src/app" "src/app" || ((missing_files++))
    check_directory "src/components" "src/components" || ((missing_files++))
    check_directory "src/lib" "src/lib" || ((missing_files++))
    check_directory "src/types" "src/types" || ((missing_files++))
    
    # Verificar scripts
    echo
    echo "🔧 Verificando scripts..."
    check_directory "scripts" "scripts" || ((missing_files++))
    check_file "scripts/install.sh" "scripts/install.sh" || ((missing_files++))
    check_file "scripts/create-admin-user.sh" "scripts/create-admin-user.sh" || ((missing_files++))
    
    # Verificar documentación
    echo
    echo "📚 Verificando documentación..."
    check_file "MANUAL-INSTALACION.md" "MANUAL-INSTALACION.md" || ((missing_files++))
    check_file "README-INSTALACION.md" "README-INSTALACION.md" || ((missing_files++))
    check_file "manual-tecnico.md" "manual-tecnico.md" || ((missing_files++))
    check_file "README-ARRECLA-MX.md" "README-ARRECLA-MX.md" || ((missing_files++))
    
    # Verificar archivos de configuración adicionales
    echo
    echo "📋 Verificando archivos adicionales..."
    check_file ".env.example" ".env.example" || ((missing_files++))
    check_file ".gitignore" ".gitignore" || ((missing_files++))
    check_file "README.md" "README.md" || ((missing_files++))
    
    # Verificar directorios importantes
    echo
    echo "📁 Verificando directorios importantes..."
    check_directory "public" "public" || ((missing_files++))
    check_directory "docs" "docs" || ((missing_files++))
    
    # Verificar archivos específicos de la aplicación
    echo
    echo "🎯 Verificando archivos específicos..."
    check_file "src/lib/inventory-utils.ts" "src/lib/inventory-utils.ts" || ((missing_files++))
    check_file "src/lib/prisma.ts" "src/lib/prisma.ts" || ((missing_files++))
    check_file "src/middleware.ts" "src/middleware.ts" || ((missing_files++))
    
    # Verificar API routes importantes
    echo
    echo "🔌 Verificando API routes..."
    check_directory "src/app/api" "src/app/api" || ((missing_files++))
    check_file "src/app/api/health/route.ts" "src/app/api/health/route.ts" || ((missing_files++))
    check_file "src/app/api/auth/session/route.ts" "src/app/api/auth/session/route.ts" || ((missing_files++))
    
    # Verificar componentes importantes
    echo
    echo "🧩 Verificando componentes..."
    check_directory "src/components/ui" "src/components/ui" || ((missing_files++))
    check_file "src/components/layout/AdminLayout.tsx" "src/components/layout/AdminLayout.tsx" || ((missing_files++))
    
    # Verificar tipos
    echo
    echo "📝 Verificando tipos TypeScript..."
    check_directory "src/types" "src/types" || ((missing_files++))
    check_file "src/types/usuario.ts" "src/types/usuario.ts" || ((missing_files++))
    check_file "src/types/ticket.ts" "src/types/ticket.ts" || ((missing_files++))
    
    # Resultado final
    echo
    print_header "Resultado de la Verificación"
    
    if [ $missing_files -eq 0 ]; then
        echo -e "${GREEN}🎉 ¡Verificación exitosa!${NC}"
        echo -e "${GREEN}✅ Todos los archivos necesarios están presentes${NC}"
        echo
        echo "📊 Resumen:"
        echo "- Archivos verificados: ✅ Completos"
        echo "- Directorios verificados: ✅ Completos"
        echo "- Configuración: ✅ Completa"
        echo "- Documentación: ✅ Completa"
        echo "- Scripts: ✅ Completos"
    else
        echo -e "${RED}⚠️ Verificación incompleta${NC}"
        echo -e "${RED}❌ Faltan $missing_files archivos/directorios${NC}"
        echo
        echo "📊 Resumen:"
        echo "- Archivos faltantes: $missing_files"
        echo "- Verificación: ❌ Incompleta"
    fi
    
    # Limpiar directorio temporal
    cd ..
    rm -rf "$temp_dir"
    
    echo
    print_message "Verificación completada"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -v, --verbose  Modo verbose (más detalles)"
    echo
    echo "Este script verifica que el archivo arregla.mx.tar.gz contiene"
    echo "todos los archivos necesarios para una instalación completa."
}

# Función principal
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            set -x
            verify_arregla_mx
            ;;
        "")
            verify_arregla_mx
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