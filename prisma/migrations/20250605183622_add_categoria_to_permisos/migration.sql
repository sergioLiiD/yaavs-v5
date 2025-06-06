/*
  Warnings:

  - Added the required column `categoria` to the `permisos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "permisos_nombre_key";

-- AlterTable
ALTER TABLE "permisos" ADD COLUMN     "categoria" TEXT NOT NULL,
ALTER COLUMN "descripcion" DROP NOT NULL;
