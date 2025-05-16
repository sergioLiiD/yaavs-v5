/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- Primero agregamos las columnas como nullable
ALTER TABLE "Cliente" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "Cliente" ADD COLUMN "activo" BOOLEAN DEFAULT true;

-- Actualizamos los registros existentes
UPDATE "Cliente" SET "passwordHash" = 'temp_password_hash', "activo" = true WHERE "passwordHash" IS NULL;

-- Hacemos las columnas NOT NULL después de actualizar los datos
ALTER TABLE "Cliente" ALTER COLUMN "passwordHash" SET NOT NULL;

-- Agregamos el índice único para email
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
