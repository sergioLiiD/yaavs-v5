#!/bin/bash

# Script de inicialización para Docker
echo "🚀 Iniciando YAAVS v5 con Docker..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear directorios necesarios
mkdir -p logs backups

# Verificar si existe archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️ Archivo .env no encontrado. Creando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "❌ No se encuentra .env.example. Por favor verifica la configuración."
        exit 1
    fi
fi

# Mostrar instrucciones
echo ""
echo "📋 INSTRUCCIONES:"
echo "1. Verifica tu archivo .env con las variables correctas"
echo "2. Ejecuta: docker-compose up --build -d"
echo "3. La aplicación estará disponible en: http://localhost:3100"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "- Construir y ejecutar:   docker-compose up --build -d"
echo "- Ver logs:              docker-compose logs -f"
echo "- Parar servicios:       docker-compose down"
echo "- Reiniciar:             docker-compose restart"
echo "- Ver estado:            docker-compose ps"
echo ""
echo "💾 BACKUP DE BASE DE DATOS:"
echo "- docker-compose exec postgres pg_dump -U postgres yaavs_db > backup_docker.sql"
echo ""
echo "✅ Listo para usar Docker!" 