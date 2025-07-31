-- Migración para agregar valor por defecto a updated_at en puntos_recoleccion
-- Ejecutar en la base de datos de producción

ALTER TABLE "puntos_recoleccion" ALTER COLUMN "updated_at" SET DEFAULT NOW();

-- Verificar que el cambio se aplicó correctamente
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at'; 