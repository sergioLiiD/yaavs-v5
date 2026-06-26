#!/usr/bin/env bash
# Diagnóstico de disco y sistema ANTES de levantar Docker.
# Uso en el servidor (no requiere Docker corriendo):
#   bash scripts/check-server-before-docker.sh
#
# Solo lectura; no modifica nada.

set -u

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[AVISO]${NC} $*"; }
fail() { echo -e "${RED}[RIESGO]${NC} $*"; }

echo "=============================================="
echo "  Chequeo pre-Docker — $(date -Iseconds 2>/dev/null || date)"
echo "=============================================="
echo

# --- Espacio en disco ---
echo "=== ESPACIO EN DISCO (df -h) ==="
df -hT 2>/dev/null || df -h
echo

echo "=== INODOS (df -i) ==="
df -i 2>/dev/null | head -20
echo

# Umbrales en partición raíz
ROOT_USE=$(df / 2>/dev/null | awk 'NR==2 {gsub(/%/,"",$5); print $5}')
if [[ -n "${ROOT_USE}" ]]; then
  if [[ "${ROOT_USE}" -ge 90 ]]; then
    fail "Disco / al ${ROOT_USE}% — NO levantar Docker hasta liberar espacio"
  elif [[ "${ROOT_USE}" -ge 80 ]]; then
    warn "Disco / al ${ROOT_USE}% — riesgo en build; limpiar antes de docker compose build"
  else
    ok "Disco / al ${ROOT_USE}% — espacio aceptable"
  fi
fi

# --- RAM y swap ---
echo "=== MEMORIA (free -h) ==="
free -h
echo

SWAP_USED=$(free 2>/dev/null | awk '/Swap:/ {print $3}')
if [[ -n "${SWAP_USED}" && "${SWAP_USED}" -gt 0 ]]; then
  warn "Swap en uso (${SWAP_USED} KB) — el servidor puede ir justo de RAM"
else
  ok "Swap sin uso relevante"
fi

echo "=== CARGA CPU (uptime) ==="
uptime
echo

# --- Errores de disco recientes ---
echo "=== ERRORES DE DISCO EN KERNEL (últimas líneas) ==="
if command -v dmesg >/dev/null 2>&1; then
  DMESG_ERR=$(dmesg -T 2>/dev/null | grep -iE 'I/O error|Buffer I/O|EXT4-fs error|XFS.*error|critical|resetting|nvme|I/O failure' | tail -15)
  if [[ -n "${DMESG_ERR}" ]]; then
    fail "Se encontraron errores de I/O en dmesg:"
    echo "${DMESG_ERR}"
  else
    ok "Sin errores de I/O obvios en dmesg reciente"
  fi
else
  warn "dmesg no disponible"
fi
echo

# --- Montajes solo lectura ---
echo "=== PARTICIONES EN SOLO LECTURA ==="
RO=$(findmnt -R -o TARGET,OPTIONS 2>/dev/null | grep -E ',ro,|,ro$' | grep -v '^TARGET' || true)
if [[ -n "${RO}" ]]; then
  fail "Hay montajes en solo lectura:"
  echo "${RO}"
else
  ok "No hay particiones raíz/var en solo lectura"
fi
echo

# --- Docker (instalado pero puede estar parado) ---
echo "=== DOCKER (estado, sin levantar servicios) ==="
if command -v docker >/dev/null 2>&1; then
  docker --version 2>/dev/null || true
  docker info 2>/dev/null | grep -E 'Server Version|Storage Driver|Docker Root Dir' || warn "Docker instalado pero el daemon no responde (normal si está parado)"
  echo
  echo "Uso de disco de Docker (si existe /var/lib/docker):"
  du -sh /var/lib/docker 2>/dev/null || echo "  (sin /var/lib/docker o sin permisos)"
else
  warn "Docker no instalado o no en PATH"
fi
echo

# --- Rutas YAAVS ---
echo "=== RUTAS DEL PROYECTO ==="
for p in /opt/yaavs-v5 /var/lib/yaavs/postgres /var/lib/docker/volumes; do
  if [[ -e "$p" ]]; then
    echo "  $p → $(du -sh "$p" 2>/dev/null | cut -f1)"
  else
    echo "  $p → (no existe)"
  fi
done
echo

if [[ -d /opt/yaavs-v5/backups ]]; then
  echo "Backups en /opt/yaavs-v5/backups:"
  ls -lh /opt/yaavs-v5/backups/*.sql.gz 2>/dev/null | tail -5 || echo "  (ningún .sql.gz reciente)"
  echo
fi

# --- Resumen ---
echo "=============================================="
echo "  CRITERIOS ANTES DE: docker compose up -d"
echo "=============================================="
echo "  • Disco / por debajo del 80% (ideal < 70%)"
echo "  • Sin errores I/O en dmesg"
echo "  • Sin particiones en solo lectura"
echo "  • Tras restore: verificar que exista .env en /opt/yaavs-v5"
echo "  • Evitar: docker compose build --no-cache"
echo "  • Preferir: docker compose up -d --build"
echo "=============================================="
