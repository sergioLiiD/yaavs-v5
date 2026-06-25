#!/usr/bin/env bash
set -euo pipefail

# Backup diario de PostgreSQL en Docker.
# Uso: ./scripts/backup-docker-db.sh
# Cron: 0 2 * * * /opt/yaavs-v5/scripts/backup-docker-db.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
CONTAINER="${POSTGRES_CONTAINER:-yaavs_postgres}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-yaavs_db}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "${BACKUP_DIR}"

if ! docker ps --format '{{.Names}}' | grep -qx "${CONTAINER}"; then
  echo "Error: contenedor ${CONTAINER} no está corriendo." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT="${BACKUP_DIR}/yaavs_backup_${TIMESTAMP}.sql.gz"

docker exec "${CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --no-owner --no-acl \
  | gzip > "${OUTPUT}"

echo "Backup creado: ${OUTPUT} ($(du -h "${OUTPUT}" | cut -f1))"

find "${BACKUP_DIR}" -name 'yaavs_backup_*.sql.gz' -mtime +"${RETENTION_DAYS}" -delete
