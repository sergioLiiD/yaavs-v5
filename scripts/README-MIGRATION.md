# Migración para Puntos de Recolección

## Problema
El error al crear puntos de recolección se debe a que el campo `updated_at` en la tabla `puntos_recoleccion` no tiene un valor por defecto.

## Solución
Aplicar la migración SQL para agregar un valor por defecto al campo `updated_at`.

## Pasos para aplicar en el servidor

### Opción 1: Usar el script bash
```bash
# Después de hacer git pull en el servidor
./scripts/fix-puntos-recoleccion-docker.sh
```

### Opción 2: Ejecutar manualmente
```bash
# Conectar al contenedor y ejecutar la migración
docker exec yaavs_app psql $DATABASE_URL -c "ALTER TABLE \"puntos_recoleccion\" ALTER COLUMN \"updated_at\" SET DEFAULT NOW();"

# Verificar que se aplicó correctamente
docker exec yaavs_app psql $DATABASE_URL -c "SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at';"
```

### Opción 3: Usar el script de Node.js
```bash
# Dentro del contenedor
docker exec yaavs_app node /app/scripts/apply-migration.js
```

## Verificación
Después de aplicar la migración, deberías poder crear puntos de recolección sin errores.

## Archivos modificados
- `prisma/schema.prisma`: Agregado `@default(now())` al campo `updated_at`
- `src/app/api/puntos-recoleccion/route.ts`: Mejorada la creación de puntos de recolección
- Scripts de migración creados 