#!/usr/bin/env bash
# Verifica que un dump SQL/.sql.gz sea restaurable y coherente con la BD actual.
#
# Uso:
#   ./scripts/verify-pgdump-sql.sh backups/yaavs_backup_20260626.sql.gz
#   ./scripts/verify-pgdump-sql.sh backups/yaavs_backup_20260626.sql.gz --compare
#
# Con --compare compara conteos COPY vs Postgres en Docker (requiere contenedor arriba).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FILE="${1:-}"
COMPARE=false
CONTAINER="${POSTGRES_CONTAINER:-yaavs_postgres}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-yaavs_db}"

if [[ -z "${FILE}" ]]; then
  echo "Uso: $0 <archivo.sql|archivo.sql.gz> [--compare]" >&2
  exit 1
fi

if [[ "${2:-}" == "--compare" ]]; then
  COMPARE=true
fi

if [[ ! -f "${FILE}" ]]; then
  echo "Error: no existe ${FILE}" >&2
  exit 1
fi

TMP_SQL="$(mktemp)"
trap 'rm -f "${TMP_SQL}"' EXIT

if [[ "${FILE}" == *.gz ]]; then
  gunzip -c "${FILE}" > "${TMP_SQL}"
else
  cp "${FILE}" "${TMP_SQL}"
fi

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

ok() {
  echo "OK: $*"
}

# 1. Cabecera SQL válida
head -5 "${TMP_SQL}" | grep -q "PostgreSQL database dump" \
  || fail "no empieza con cabecera PostgreSQL database dump"

# 2. Sin ruido pg_dump mezclado
PG_DUMP_LINES="$(grep -c '^pg_dump:' "${TMP_SQL}" || true)"
if [[ "${PG_DUMP_LINES}" -gt 0 ]]; then
  fail "contiene ${PG_DUMP_LINES} líneas pg_dump: (dump corrupto)"
fi
ok "sin líneas pg_dump:"

# 3. Estructura actual esperada
for marker in \
  'cancelado_por_id' \
  'excepciones_flujo' \
  'TipoExcepcionFlujo' \
  'presupuestos_independientes' \
  'devoluciones'
do
  grep -q "${marker}" "${TMP_SQL}" || fail "falta marcador de esquema: ${marker}"
done
ok "marcadores de esquema actuales presentes"

# 4. Conteos en bloques COPY
count_copy_rows() {
  local table="$1"
  awk -v t="COPY public.${table} " '
    $0 ~ "^" t { in_copy=1; next }
    in_copy && /^\\\./ { exit }
    in_copy { c++ }
    END { print c+0 }
  ' "${TMP_SQL}"
}

declare -A COPY_COUNTS
TABLES=(tickets usuarios productos clientes roles presupuestos pagos)
for table in "${TABLES[@]}"; do
  COPY_COUNTS["${table}"]="$(count_copy_rows "${table}")"
done

echo ""
echo "Filas en COPY del dump:"
for table in "${TABLES[@]}"; do
  echo "  ${table}: ${COPY_COUNTS[${table}]}"
done

if [[ "${COPY_COUNTS[tickets]}" -lt 1 ]]; then
  fail "tickets vacío en el dump"
fi
if [[ "${COPY_COUNTS[usuarios]}" -lt 1 ]]; then
  fail "usuarios vacío en el dump"
fi
ok "datos principales presentes en COPY"

# 5. Comparar con BD viva (opcional)
if [[ "${COMPARE}" == true ]]; then
  if ! docker ps --format '{{.Names}}' | grep -qx "${CONTAINER}"; then
    fail "contenedor ${CONTAINER} no está corriendo (necesario para --compare)"
  fi

  echo ""
  echo "Comparación con BD viva (${CONTAINER}/${DB_NAME}):"
  LIVE_COUNTS="$(
    docker exec -i "${CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" -At -c "
      SELECT 'tickets' || '|' || COUNT(*)::text FROM tickets
      UNION ALL SELECT 'usuarios' || '|' || COUNT(*)::text FROM usuarios
      UNION ALL SELECT 'productos' || '|' || COUNT(*)::text FROM productos
      UNION ALL SELECT 'clientes' || '|' || COUNT(*)::text FROM clientes
      UNION ALL SELECT 'roles' || '|' || COUNT(*)::text FROM roles
      UNION ALL SELECT 'presupuestos' || '|' || COUNT(*)::text FROM presupuestos
      UNION ALL SELECT 'pagos' || '|' || COUNT(*)::text FROM pagos;
    "
  )"

  mismatches=0
  while IFS='|' read -r table live; do
    dump="${COPY_COUNTS[${table}]:-0}"
    if [[ "${dump}" != "${live}" ]]; then
      echo "  MISMATCH ${table}: dump=${dump} live=${live}" >&2
      mismatches=$((mismatches + 1))
    else
      echo "  ${table}: ${live} (coincide)"
    fi
  done <<< "${LIVE_COUNTS}"

  if [[ "${mismatches}" -gt 0 ]]; then
    fail "${mismatches} tabla(s) no coinciden entre dump y BD viva"
  fi
  ok "conteos COPY coinciden con BD viva"
fi

echo ""
echo "Verificación completada: ${FILE} ($(du -h "${FILE}" | cut -f1))"
