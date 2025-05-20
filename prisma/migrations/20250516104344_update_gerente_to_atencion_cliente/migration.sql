-- Actualizar usuarios con nivel GERENTE a ATENCION_CLIENTE
UPDATE "usuarios"
SET "nivel" = 'ATENCION_CLIENTE'
WHERE "nivel" = 'GERENTE';

-- Modificar el enum NivelUsuario para eliminar GERENTE
ALTER TYPE "NivelUsuario" RENAME TO "NivelUsuario_old";
CREATE TYPE "NivelUsuario" AS ENUM ('ADMINISTRADOR', 'TECNICO', 'ATENCION_CLIENTE');

-- Actualizar la columna nivel y su valor por defecto
ALTER TABLE "usuarios" ALTER COLUMN "nivel" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "nivel" TYPE "NivelUsuario" USING "nivel"::text::"NivelUsuario";
ALTER TABLE "usuarios" ALTER COLUMN "nivel" SET DEFAULT 'TECNICO'::"NivelUsuario";

DROP TYPE "NivelUsuario_old"; 