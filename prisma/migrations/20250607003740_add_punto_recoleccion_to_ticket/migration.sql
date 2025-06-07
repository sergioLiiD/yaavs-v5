/*
  Warnings:

  - The primary key for the `puntos_recoleccion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `puntos_recoleccion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parentId` column on the `puntos_recoleccion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `usuarios_puntos_recoleccion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `usuarios_puntos_recoleccion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[usuarioId,puntoRecoleccionId]` on the table `usuarios_puntos_recoleccion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `puntoRecoleccionId` to the `tickets` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `puntoRecoleccionId` on the `usuarios_puntos_recoleccion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "puntos_recoleccion" DROP CONSTRAINT "puntos_recoleccion_parentId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" DROP CONSTRAINT "usuarios_puntos_recoleccion_puntoRecoleccionId_fkey";

-- DropIndex
DROP INDEX "usuarios_puntos_recoleccion_puntoRecoleccionId_usuarioId_key";

-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP CONSTRAINT "puntos_recoleccion_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "parentId",
ADD COLUMN     "parentId" INTEGER,
ADD CONSTRAINT "puntos_recoleccion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "puntoRecoleccionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "usuarios_puntos_recoleccion" DROP CONSTRAINT "usuarios_puntos_recoleccion_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "puntoRecoleccionId",
ADD COLUMN     "puntoRecoleccionId" INTEGER NOT NULL,
ADD CONSTRAINT "usuarios_puntos_recoleccion_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_puntos_recoleccion_usuarioId_puntoRecoleccionId_key" ON "usuarios_puntos_recoleccion"("usuarioId", "puntoRecoleccionId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_puntoRecoleccionId_fkey" FOREIGN KEY ("puntoRecoleccionId") REFERENCES "puntos_recoleccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_recoleccion" ADD CONSTRAINT "puntos_recoleccion_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" ADD CONSTRAINT "usuarios_puntos_recoleccion_puntoRecoleccionId_fkey" FOREIGN KEY ("puntoRecoleccionId") REFERENCES "puntos_recoleccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
