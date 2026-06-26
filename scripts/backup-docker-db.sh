#!/usr/bin/env bash
set -euo pipefail

# Backup de PostgreSQL en Docker (SQL limpio, sin mezclar stderr de pg_dump).
#
# Uso:
#   ./scripts/backup-docker-db.sh
#   ./scripts/backup-docker-db.sh --verify
#
# Cron: 0 2 * * * /opt/yaavs-v5/scripts/backup-docker-db.sh --verify

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
CONTAINER="${POSTGRES_CONTAINER:-yaavs_postgres}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-yaavs_db}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
VERIFY=false

if [[ "${1:-}" == "--verify" ]]; then
  VERIFY=true
fi

mkdir -p "${BACKUP_DIR}"

if ! docker ps --format '{{.Names}}' | grep -qx "${CONTAINER}"; then
  echo "Error: contenedor ${CONTAINER} no está corriendo." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT="${BACKUP_DIR}/yaavs_backup_${TIMESTAMP}.sql.gz"
STDERR_LOG="${BACKUP_DIR}/yaavs_backup_${TIMESTAMP}.stderr"

echo "==> Creando backup de ${DB_NAME}..."
# IMPORTANTE: stderr a archivo aparte. NUNCA usar: pg_dump 2>&1 | gzip
docker exec "${CONTAINER}" pg_dump \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-acl \
  --format=plain \
  2> "${STDERR_LOG}" | gzip > "${OUTPUT}"

if [[ ! -s "${OUTPUT}" ]]; then
  echo "Error: el archivo de backup quedó vacío." >&2
  exit 1
fi

if grep -q '^pg_dump:' "${STDERR_LOG}" 2>/dev/null; then
  echo "Aviso: pg_dump escribió mensajes en stderr (normal). Ver: ${STDERR_LOG}"
fi

echo "Backup creado: ${OUTPUT} ($(du -h "${OUTPUT}" | cut -f1))"

if [[ "${VERIFY}" == true ]]; then
  echo "==> Verificando backup..."
  bash "${ROOT_DIR}/scripts/verify-pgdump-sql.sh" "${OUTPUT}" --compare
fi

find "${BACKUP_DIR}" -name 'yaavs_backup_*.sql.gz' -mtime +"${RETENTION_DAYS}" -delete
find "${BACKUP_DIR}" -name 'yaavs_backup_*.stderr' -mtime +"${RETENTION_DAYS}" -delete

echo "Listo."
