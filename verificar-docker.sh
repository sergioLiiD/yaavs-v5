#!/bin/bash

# Script rápido para verificar el estado de Docker antes del backup

echo "🔍 Verificando estado de Docker..."

# Verificar Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker está instalado"
    docker --version
else
    echo "❌ Docker no está instalado"
    exit 1
fi

echo ""

# Verificar contenedores
echo "📦 Contenedores activos:"
docker ps --filter "name=yaavs" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# Verificar específicamente PostgreSQL
if docker ps | grep -q "yaavs_postgres"; then
    echo "✅ Contenedor yaavs_postgres está corriendo"
    
    # Verificar que PostgreSQL responda
    if docker exec yaavs_postgres pg_isready -U postgres -d yaavs_db > /dev/null 2>&1; then
        echo "✅ PostgreSQL está respondiendo correctamente"
    else
        echo "❌ PostgreSQL no está respondiendo"
    fi
else
    echo "❌ Contenedor yaavs_postgres NO está corriendo"
    echo "   Para iniciarlo: docker-compose up -d postgres"
fi

echo ""

# Verificar directorio de backups
if [ -d "./backups" ]; then
    echo "✅ Directorio ./backups existe"
    BACKUP_COUNT=$(ls -1 ./backups/*.sql* 2>/dev/null | wc -l | tr -d ' ')
    echo "   Backups existentes: $BACKUP_COUNT"
else
    echo "ℹ️  Directorio ./backups no existe (se creará automáticamente)"
fi

echo ""
echo "✅ Verificación completada"

