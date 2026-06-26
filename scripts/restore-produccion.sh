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

echo "==> Evitar initdb con SQLs viejos en backups/"
mkdir -p /tmp/backups-hold
shopt -s nullglob
for f in backups/*.sql backups/*.sql.gz; do
  base="$(basename "$f")"
  [[ "$base" == "yaavs_limpio_20251125.sql.gz" ]] && continue
  mv "$f" /tmp/backups-hold/
done

echo "==> Arrancar Postgres"
docker compose up -d postgres
sleep 15

echo "==> Restaurar dump limpio"
gunzip -c "${BACKUP}" | docker exec -i "${CONTAINER}" psql -U postgres -d yaavs_db -v ON_ERROR_STOP=1

echo "==> Verificar tickets"
docker exec -i "${CONTAINER}" psql -U postgres -d yaavs_db -c "SELECT COUNT(*) FROM tickets;"

echo ""
echo "Listo. Siguiente:"
echo "  docker compose up -d --build"
echo "  docker compose exec app npx prisma migrate deploy"
