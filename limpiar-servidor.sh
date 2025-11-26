#!/bin/bash

# Script para limpiar espacio en disco del servidor
# Ejecutar desde el directorio del proyecto: ./limpiar-servidor.sh

set -e

echo "🧹 Iniciando limpieza del servidor..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
}

# Verificar espacio antes
print_step "1. Verificando espacio en disco antes de la limpieza..."
df -h / | tail -1
echo ""

# Limpiar logs de Docker
print_step "2. Limpiando logs de Docker..."
if command -v docker &> /dev/null; then
    # Limpiar logs de contenedores (mantener últimos 100MB)
    docker ps -q | xargs -r docker inspect --format='{{.LogPath}}' 2>/dev/null | xargs -r truncate -s 10M 2>/dev/null || true
    print_status "✅ Logs de contenedores limpiados"
else
    print_warning "Docker no encontrado, saltando limpieza de logs"
fi

# Limpiar logs de la aplicación
print_step "3. Limpiando logs de la aplicación..."
if [ -d "./logs" ]; then
    LOG_SIZE_BEFORE=$(du -sh ./logs 2>/dev/null | cut -f1 || echo "0")
    find ./logs -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true
    LOG_SIZE_AFTER=$(du -sh ./logs 2>/dev/null | cut -f1 || echo "0")
    print_status "✅ Logs de aplicación limpiados (Antes: $LOG_SIZE_BEFORE, Después: $LOG_SIZE_AFTER)"
else
    print_status "No hay directorio de logs para limpiar"
fi

# Limpiar backups antiguos (mantener últimos 7 días)
print_step "4. Limpiando backups antiguos..."
if [ -d "./backups" ]; then
    BACKUP_COUNT_BEFORE=$(ls -1 ./backups/*.sql* 2>/dev/null | wc -l | tr -d ' ')
    BACKUP_SIZE_BEFORE=$(du -sh ./backups 2>/dev/null | cut -f1 || echo "0")
    
    # Eliminar backups SQL más antiguos de 7 días
    find ./backups -name "*.sql" -mtime +7 -delete 2>/dev/null || true
    find ./backups -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
    
    BACKUP_COUNT_AFTER=$(ls -1 ./backups/*.sql* 2>/dev/null | wc -l | tr -d ' ')
    BACKUP_SIZE_AFTER=$(du -sh ./backups 2>/dev/null | cut -f1 || echo "0")
    print_status "✅ Backups antiguos eliminados (Antes: $BACKUP_COUNT_BEFORE archivos, Después: $BACKUP_COUNT_AFTER archivos)"
    print_status "   Tamaño: $BACKUP_SIZE_BEFORE → $BACKUP_SIZE_AFTER"
else
    print_status "No hay directorio de backups para limpiar"
fi

# Limpiar node_modules si existe (se regenera con npm install)
print_step "5. Verificando node_modules..."
if [ -d "./node_modules" ] && [ -f "./package.json" ]; then
    NODE_SIZE=$(du -sh ./node_modules 2>/dev/null | cut -f1 || echo "0")
    print_warning "⚠️  node_modules encontrado ($NODE_SIZE). No se elimina automáticamente."
    print_warning "   Si necesitas espacio, puedes eliminarlo: rm -rf node_modules"
    print_warning "   Luego reinstalar con: npm install"
else
    print_status "No hay node_modules local para limpiar"
fi

# Limpiar Docker (imágenes, contenedores, volúmenes no usados)
print_step "6. Limpiando recursos de Docker..."
if command -v docker &> /dev/null; then
    # Ver espacio usado por Docker antes
    DOCKER_SIZE_BEFORE=$(docker system df 2>/dev/null | grep -E "Total" | awk '{print $3}' || echo "0")
    
    # Limpiar contenedores detenidos
    docker container prune -f 2>/dev/null || true
    print_status "✅ Contenedores detenidos eliminados"
    
    # Limpiar imágenes no usadas
    docker image prune -af --filter "until=168h" 2>/dev/null || true
    print_status "✅ Imágenes no usadas (más de 7 días) eliminadas"
    
    # Limpiar volúmenes no usados (CUIDADO: solo los que no están en uso)
    print_warning "⚠️  Limpiando volúmenes no usados..."
    docker volume prune -f 2>/dev/null || true
    print_status "✅ Volúmenes no usados eliminados"
    
    # Limpiar redes no usadas
    docker network prune -f 2>/dev/null || true
    print_status "✅ Redes no usadas eliminadas"
    
    # Limpieza general del sistema Docker
    docker system prune -af --volumes --filter "until=168h" 2>/dev/null || true
    print_status "✅ Sistema Docker limpiado"
    
    DOCKER_SIZE_AFTER=$(docker system df 2>/dev/null | grep -E "Total" | awk '{print $3}' || echo "0")
    print_status "   Docker: $DOCKER_SIZE_BEFORE → $DOCKER_SIZE_AFTER"
else
    print_warning "Docker no encontrado, saltando limpieza de Docker"
fi

# Limpiar cache de npm (si existe)
print_step "7. Limpiando cache de npm..."
if command -v npm &> /dev/null; then
    NPM_CACHE_SIZE_BEFORE=$(du -sh ~/.npm 2>/dev/null | cut -f1 || echo "0")
    npm cache clean --force 2>/dev/null || true
    print_status "✅ Cache de npm limpiado (Antes: $NPM_CACHE_SIZE_BEFORE)"
else
    print_status "npm no encontrado, saltando limpieza de cache"
fi

# Limpiar archivos temporales del sistema
print_step "8. Limpiando archivos temporales del sistema..."
if [ -d "/tmp" ]; then
    TEMP_SIZE_BEFORE=$(du -sh /tmp 2>/dev/null | cut -f1 || echo "0")
    find /tmp -type f -atime +7 -delete 2>/dev/null || true
    TEMP_SIZE_AFTER=$(du -sh /tmp 2>/dev/null | cut -f1 || echo "0")
    print_status "✅ Archivos temporales limpiados (Antes: $TEMP_SIZE_BEFORE, Después: $TEMP_SIZE_AFTER)"
fi

# Limpiar archivos .next si existe (se regenera con build)
print_step "9. Verificando archivos de build..."
if [ -d "./.next" ]; then
    NEXT_SIZE=$(du -sh ./.next 2>/dev/null | cut -f1 || echo "0")
    print_warning "⚠️  Directorio .next encontrado ($NEXT_SIZE). No se elimina automáticamente."
    print_warning "   Se regenera con: npm run build"
else
    print_status "No hay directorio .next para limpiar"
fi

# Verificar espacio después
echo ""
print_step "10. Verificando espacio en disco después de la limpieza..."
df -h / | tail -1
echo ""

# Resumen final
print_status "════════════════════════════════════════════════════════════"
print_status "✅ Limpieza completada!"
print_status "════════════════════════════════════════════════════════════"
print_status ""
print_status "Espacio liberado. Verifica el espacio en disco arriba."
print_status "════════════════════════════════════════════════════════════"

