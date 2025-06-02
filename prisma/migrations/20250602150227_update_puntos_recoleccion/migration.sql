/*
  Warnings:

  - You are about to drop the column `apellidoMaterno` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `apellidoPaterno` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `celular` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `nombreComercial` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `nombreResponsable` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `urlNegocio` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - Added the required column `location` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP COLUMN "apellidoMaterno",
DROP COLUMN "apellidoPaterno",
DROP COLUMN "celular",
DROP COLUMN "nombreComercial",
DROP COLUMN "nombreResponsable",
DROP COLUMN "telefono",
DROP COLUMN "urlNegocio",
ADD COLUMN     "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRepairPoint" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" JSONB NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "schedule" JSONB NOT NULL,
ADD COLUMN     "url" TEXT;

-- AddForeignKey
ALTER TABLE "puntos_recoleccion" ADD CONSTRAINT "puntos_recoleccion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
