# Restauración de producción — YAAVS v5

**Fecha:** 25 de junio de 2026  
**Situación:** Forense sin resultados. Restaurar desde backup SQL + código actual (fix zona horaria).

---

## Qué se restaura

| Dato | Fuente |
|------|--------|
| Tickets hasta 25 nov 2025 (~154) | `yaavs_backup_pre_migracion_20251125_101546.sql.gz` |
| Uploads (fotos/PDFs) | Tar de uploads en Mac |
| Código + fix timezone | `git pull` en `main` (commit `af22df7` o posterior) |
| Tickets nov 2025 → jun 2026 | Actas (captura manual posterior) |

---

## Antes de empezar

1. **Quitar la ISO** de Ubuntu en el panel del hypervisor.
2. Arrancar el servidor **normal** (no live).
3. Tener a mano el `.env` del servidor (no sobrescribirlo con uno vacío del repo).

---

## Paso 1 — Subir archivos desde tu Mac

```bash
# Backup SQL (el mejor disponible)
scp backups/servidor-20260625/extraido/opt/yaavs-v5/backups/yaavs_backup_pre_migracion_20251125_101546.sql.gz \
  administrador@SERVIDOR:/opt/yaavs-v5/backups/

# Uploads (ajusta la ruta del tar en tu Mac)
scp /ruta/uploads-yaavs-*.tar.gz \
  administrador@SERVIDOR:/opt/yaavs-v5/backups/
```

---

## Paso 2 — Actualizar código en el servidor

```bash
cd /opt/yaavs-v5

# Conservar .env actual
cp .env .env.bak

git fetch origin
git checkout main
git pull origin main

# Si no hay git configurado, clonar de nuevo y copiar .env:
# cp .env.bak .env
```

Verificar que exista `src/lib/datetime.ts` y `TZ=America/Mexico_City` en `Dockerfile`.

---

## Paso 3 — Preparar Postgres (volumen vacío)

```bash
cd /opt/yaavs-v5

docker compose down

# Solo si el volumen postgres está vacío (caso actual):
docker volume rm yaavs-v5_postgres_data
```

> **IMPORTANTE:** Si Docker pregunta si recrear un volumen con datos, responder **`N`**.

```bash
docker compose up -d postgres

# Esperar a que esté healthy (~30 s)
docker compose ps
docker compose logs --tail=20 postgres
```

---

## Paso 4 — Restaurar la base de datos

**No** confiar en `docker-entrypoint-initdb.d` si hay muchos `.sql` en `backups/` — restaurar manualmente:

```bash
cd /opt/yaavs-v5

gunzip -c backups/yaavs_backup_pre_migracion_20251125_101546.sql.gz | \
  docker exec -i yaavs_postgres psql -U postgres -d yaavs_db
```

Si falla por objetos existentes (BD recién inicializada con seed):

```bash
docker exec -i yaavs_postgres psql -U postgres -c "DROP DATABASE yaavs_db;"
docker exec -i yaavs_postgres psql -U postgres -c "CREATE DATABASE yaavs_db;"

gunzip -c backups/yaavs_backup_pre_migracion_20251125_101546.sql.gz | \
  docker exec -i yaavs_postgres psql -U postgres -d yaavs_db
```

**Verificar:**

```bash
docker exec -i yaavs_postgres psql -U postgres -d yaavs_db -c "SELECT COUNT(*) FROM tickets;"
docker exec -i yaavs_postgres psql -U postgres -d yaavs_db -c "SELECT MAX(created_at) FROM tickets;"
```

Esperado: ~**154** tickets, fecha máxima ~**2025-11-25**.

---

## Paso 5 — Migraciones Prisma (esquema actual del código)

El backup es de nov 2025; el código puede tener migraciones posteriores:

```bash
cd /opt/yaavs-v5
docker compose run --rm migrations
```

Si `migrations` no está en el compose del servidor:

```bash
docker compose run --rm app npx prisma migrate deploy
```

---

## Paso 6 — Restaurar uploads

Identificar dónde está el volumen:

```bash
docker volume inspect yaavs-v5_uploads_data
```

Ruta típica: `/var/lib/docker/volumes/yaavs-v5_uploads_data/_data`

```bash
cd /opt/yaavs-v5

# Ver estructura del tar antes de extraer
tar -tzf backups/uploads-yaavs-*.tar.gz | head -20

# Extraer (ajustar --strip-components según la estructura del tar)
sudo tar -xzf backups/uploads-yaavs-*.tar.gz \
  -C /var/lib/docker/volumes/yaavs-v5_uploads_data/_data

sudo chown -R 1001:1001 /var/lib/docker/volumes/yaavs-v5_uploads_data/_data
```

---

## Paso 7 — Levantar la aplicación

```bash
cd /opt/yaavs-v5
docker compose up -d --build
docker compose ps
docker compose logs --tail=30 app
```

Probar en navegador: `http://arregla.mx:4001` (o el dominio configurado en `.env`).

---

## Paso 8 — Verificar zona horaria

1. Crear un ticket de prueba.
2. Exportar a Excel.
3. La hora debe coincidir con Ciudad de México (sin desfase de +6 h).

---

## Paso 9 — Backup diario automático

```bash
cd /opt/yaavs-v5
chmod +x scripts/backup-docker-db.sh

# Probar manualmente
./scripts/backup-docker-db.sh

# Cron diario a las 2:00 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/yaavs-v5/scripts/backup-docker-db.sh >> /opt/yaavs-v5/logs/backup-cron.log 2>&1") | crontab -
```

Copiar backups periódicamente **fuera del servidor** (tu Mac, S3, etc.).

---

## Checklist final

- [ ] Sitio accesible
- [ ] Login funciona
- [ ] ~154 tickets visibles
- [ ] Uploads antiguos se ven
- [ ] Export Excel con hora correcta
- [ ] Backup diario configurado
- [ ] Plan de captura desde actas (nov 2025 → jun 2026)

---

## Errores frecuentes

| Error | Solución |
|-------|----------|
| `mount ... no such file or directory` | `sudo mkdir -p /var/lib/yaavs/postgres /var/lib/yaavs/uploads` + permisos |
| Docker pregunta recrear volumen | **`N`** si hay datos |
| `relation already exists` al restaurar SQL | `DROP DATABASE` + restaurar de nuevo |
| App no conecta a BD | Revisar `DATABASE_URL` en `.env` (host `postgres`, no `localhost`) |

---

*Documento para restauración post-incidente — YAAVS v5*
