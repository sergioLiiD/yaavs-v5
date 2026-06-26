#!/usr/bin/env bash
# Restaura la BD de producción desde el dump limpio en el repo.
# Uso en el servidor:
#   cd /opt/yaavs-v5
#   bash scripts/restore-produccion.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP="${ROOT_DIR}/backups/yaavs_limpio_20251125.sql.gz"
CONTAINER="${POSTGRES_CONTAINER:-yaavs_postgres}"

if [[ ! -f "${BACKUP}" ]]; then
  echo "Error: no existe ${BACKUP}" >&2
  echo "Haz git pull para traer el dump limpio." >&2
  exit 1
fi

cd "${ROOT_DIR}"

echo "==> Parar servicios"
docker compose down

echo "==> Postgres vacío"
sudo rm -rf /var/lib/yaavs/postgres
sudo mkdir -p /var/lib/yaavs/postgres /var/lib/yaavs/uploads
sudo chown -R 70:70 /var/lib/yaavs/postgres
sudo chown -R 1001:1001 /var/lib/yaavs/uploads 2>/dev/null || true

echo "==> Vaciar backups/ (initdb ejecuta todo lo que haya ahí)"
mkdir -p /tmp/backups-hold
shopt -s nullglob
for f in backups/*.sql backups/*.sql.gz; do
  mv "$f" /tmp/backups-hold/
done
cp "${BACKUP}" /tmp/yaavs_limpio_20251125.sql.gz

echo "==> Arrancar Postgres (sin scripts en initdb)"
docker compose up -d postgres
sleep 15

echo "==> BD vacía antes del restore"
docker exec -i "${CONTAINER}" psql -U postgres -c "DROP DATABASE IF EXISTS yaavs_db;"
docker exec -i "${CONTAINER}" psql -U postgres -c "CREATE DATABASE yaavs_db;"
docker exec -i "${CONTAINER}" psql -U postgres -c "DROP ROLE IF EXISTS yaavs_user;" 2>/dev/null || true
docker exec -i "${CONTAINER}" psql -U postgres -c \
  "CREATE ROLE yaavs_user WITH LOGIN SUPERUSER PASSWORD 'yaavs_password_2024';" 2>/dev/null || true

echo "==> Restaurar dump limpio"
gunzip -c /tmp/yaavs_limpio_20251125.sql.gz | \
  docker exec -i "${CONTAINER}" psql -U postgres -d yaavs_db -v ON_ERROR_STOP=1

echo "==> Devolver backups/ (excepto el dump limpio del repo)"
cp /tmp/yaavs_limpio_20251125.sql.gz "${BACKUP}"
for f in /tmp/backups-hold/*.sql /tmp/backups-hold/*.sql.gz; do
  [[ -f "$f" ]] && mv "$f" backups/
done

echo "==> Verificar tickets"
docker exec -i "${CONTAINER}" psql -U postgres -d yaavs_db -c "SELECT COUNT(*) FROM tickets;"

echo ""
echo "Listo. Siguiente:"
echo "  docker compose up -d --build"
echo "  docker compose exec app npx prisma migrate deploy"
