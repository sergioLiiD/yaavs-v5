#!/bin/bash

# Script para migrar datos existentes a Docker
echo "🚀 Migración de datos locales a Docker YAAVS v5"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear backup de datos locales
echo "📦 Creando backup de datos locales..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="migration_backup_${TIMESTAMP}.sql"

# Intentar backup de BD local
echo "💾 Respaldando base de datos local..."
if PGPASSWORD=postgres pg_dump -h localhost -U postgres yaavs_db > "$BACKUP_FILE" 2>/dev/null; then
    echo "✅ Backup local creado: $BACKUP_FILE"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "   Tamaño: $BACKUP_SIZE"
else
    echo "⚠️ No se pudo crear backup automático de la BD local."
    echo "   ¿Deseas continuar sin migrar datos existentes? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Migración cancelada."
        exit 1
    fi
    echo "⚠️ Continuando sin datos existentes..."
    BACKUP_FILE=""
fi

# Parar servicios locales si están corriendo
echo "🛑 Parando servicios locales (si están ejecutándose)..."
pkill -f "next" 2>/dev/null || true
pkill -f "node.*3100" 2>/dev/null || true

# Crear directorios necesarios
mkdir -p logs backups

# Copiar backup al directorio de backups si existe
if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    cp "$BACKUP_FILE" "./backups/"
    echo "📁 Backup copiado a ./backups/"
fi

# Iniciar solo PostgreSQL en Docker
echo "🐘 Iniciando PostgreSQL en Docker..."
docker-compose up -d postgres

# Esperar que PostgreSQL esté listo
echo "⏳ Esperando que PostgreSQL esté listo..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U postgres -q 2>/dev/null; then
        echo "✅ PostgreSQL está listo"
        break
    fi
    echo "   Esperando... ($i/30)"
    sleep 2
done

# Verificar que PostgreSQL esté funcionando
if ! docker-compose exec postgres pg_isready -U postgres -q 2>/dev/null; then
    echo "❌ PostgreSQL no está funcionando después de 60 segundos"
    echo "   Revisa los logs con: docker-compose logs postgres"
    exit 1
fi

# Importar datos si hay backup
if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    echo "📥 Importando datos existentes..."
    
    # Crear la base de datos si no existe
    docker-compose exec postgres psql -U postgres -c "CREATE DATABASE yaavs_db;" 2>/dev/null || true
    
    # Importar datos
    if docker-compose exec -T postgres psql -U postgres yaavs_db < "$BACKUP_FILE"; then
        echo "✅ Datos importados exitosamente"
    else
        echo "⚠️ Error al importar datos. Continuando con base de datos limpia..."
        # Ejecutar migraciones de Prisma si falla la importación
        echo "🔧 Ejecutando migraciones de Prisma..."
        docker-compose run --rm migrations npx prisma migrate deploy
    fi
else
    echo "🔧 Ejecutando migraciones de Prisma..."
    docker-compose run --rm migrations npx prisma migrate deploy
    
    echo "🌱 Ejecutando seed de datos iniciales..."
    docker-compose run --rm migrations npx prisma db seed
fi

# Iniciar la aplicación
echo "🚀 Iniciando aplicación..."
docker-compose up -d app

# Esperar que la aplicación esté lista
echo "⏳ Esperando que la aplicación esté lista..."
for i in {1..60}; do
    if curl -s http://localhost:3100/api/health > /dev/null 2>&1; then
        echo "✅ Aplicación está funcionando"
        break
    fi
    echo "   Esperando... ($i/60)"
    sleep 2
done

# Verificar estado final
echo ""
echo "📊 Estado de los servicios:"
docker-compose ps

# Mostrar URLs
echo ""
echo "🌐 URLs de acceso:"
echo "   Aplicación: http://localhost:3100"
echo "   Health Check: http://localhost:3100/api/health"

# Mostrar credenciales por defecto
echo ""
echo "🔑 Credenciales por defecto:"
echo "   Admin: admin@example.com / admin123"
echo "   Sergio: sergio@hoom.mx / whoS5un0%"

# Limpiar archivo de backup temporal
if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    rm "$BACKUP_FILE"
    echo "🧹 Archivo temporal de backup eliminado"
fi

echo ""
echo "✅ MIGRACIÓN COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Para ver logs: docker-compose logs -f"
echo "🛑 Para parar: docker-compose down"
echo "🔄 Para reiniciar: docker-compose restart"
echo ""
echo "📚 Consulta README-DOCKER.md para más información" 