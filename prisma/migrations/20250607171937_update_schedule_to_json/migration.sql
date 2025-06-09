/*
  Warnings:

  - Changed the type of `schedule` on the `puntos_recoleccion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Primero creamos una columna temporal
ALTER TABLE "puntos_recoleccion" ADD COLUMN "schedule_new" JSONB;

-- Convertimos los datos existentes
UPDATE "puntos_recoleccion"
SET "schedule_new" = schedule::jsonb;

-- Eliminamos la columna antigua
ALTER TABLE "puntos_recoleccion" DROP COLUMN "schedule";

-- Renombramos la nueva columna
ALTER TABLE "puntos_recoleccion" RENAME COLUMN "schedule_new" TO "schedule";

-- Hacemos la columna NOT NULL
ALTER TABLE "puntos_recoleccion" ALTER COLUMN "schedule" SET NOT NULL;
