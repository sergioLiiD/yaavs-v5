/*
  Warnings:

  - You are about to drop the column `activo` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `usuarios_puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `rolId` on the `usuarios_puntos_recoleccion` table. All the data in the column will be lost.
  - Made the column `url` on table `puntos_recoleccion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nivel` to the `usuarios_puntos_recoleccion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" DROP CONSTRAINT "usuarios_puntos_recoleccion_rolId_fkey";

-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP COLUMN "activo",
ALTER COLUMN "location" SET DATA TYPE TEXT,
ALTER COLUMN "schedule" SET DATA TYPE TEXT,
ALTER COLUMN "url" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios_puntos_recoleccion" DROP COLUMN "activo",
DROP COLUMN "rolId",
ADD COLUMN     "nivel" "NivelUsuarioPunto" NOT NULL;
