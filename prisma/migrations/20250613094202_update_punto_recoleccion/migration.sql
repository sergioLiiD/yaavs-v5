/*
  Warnings:

  - You are about to drop the column `direccion` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `latitud` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - Added the required column `location` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP COLUMN "direccion",
DROP COLUMN "latitud",
DROP COLUMN "longitud",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "is_headquarters" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" JSONB NOT NULL,
ADD COLUMN     "parent_id" INTEGER,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "schedule" JSONB NOT NULL,
ADD COLUMN     "url" TEXT;

-- AddForeignKey
ALTER TABLE "puntos_recoleccion" ADD CONSTRAINT "puntos_recoleccion_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
