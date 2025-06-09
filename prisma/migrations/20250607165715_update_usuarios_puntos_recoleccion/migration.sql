/*
  Warnings:

  - You are about to drop the column `nivel` on the `usuarios_puntos_recoleccion` table. All the data in the column will be lost.
  - Added the required column `rolId` to the `usuarios_puntos_recoleccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuarios_puntos_recoleccion" DROP COLUMN "nivel",
ADD COLUMN     "rolId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "usuarios_puntos_recoleccion_usuarioId_idx" ON "usuarios_puntos_recoleccion"("usuarioId");

-- CreateIndex
CREATE INDEX "usuarios_puntos_recoleccion_puntoRecoleccionId_idx" ON "usuarios_puntos_recoleccion"("puntoRecoleccionId");

-- CreateIndex
CREATE INDEX "usuarios_puntos_recoleccion_rolId_idx" ON "usuarios_puntos_recoleccion"("rolId");

-- AddForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" ADD CONSTRAINT "usuarios_puntos_recoleccion_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
