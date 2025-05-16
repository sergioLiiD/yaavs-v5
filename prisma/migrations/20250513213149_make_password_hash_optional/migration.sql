-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Actualizar el tipo de registro basado en la presencia de passwordHash
UPDATE "Cliente"
SET "tipoRegistro" = CASE 
    WHEN "passwordHash" IS NOT NULL THEN 'Registro propio'
    ELSE 'Registro en tienda'
END;
