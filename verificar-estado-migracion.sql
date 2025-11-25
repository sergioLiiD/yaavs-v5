-- Verificar estado de la migración y cambios en la tabla pagos

-- 1. Verificar si la columna venta_id ya existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pagos' AND column_name IN ('ticket_id', 'venta_id');

-- 2. Verificar si el constraint ya existe
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'pagos' AND constraint_name LIKE '%venta%';

-- 3. Verificar migraciones aplicadas
SELECT migration_name, finished_at 
FROM _prisma_migrations 
WHERE migration_name LIKE '%ventas%' OR migration_name LIKE '%pagos%'
ORDER BY finished_at DESC 
LIMIT 5;

