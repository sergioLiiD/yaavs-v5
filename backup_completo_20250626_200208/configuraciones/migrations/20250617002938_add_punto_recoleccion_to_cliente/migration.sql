/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `puntos_recoleccion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `puntos_recoleccion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "punto_recoleccion_id" INTEGER;

-- AlterTable
ALTER TABLE "puntos_recoleccion" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "schedule" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "puntos_recoleccion_email_key" ON "puntos_recoleccion"("email");

-- CreateIndex
CREATE UNIQUE INDEX "puntos_recoleccion_url_key" ON "puntos_recoleccion"("url");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_punto_recoleccion_id_fkey" FOREIGN KEY ("punto_recoleccion_id") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
