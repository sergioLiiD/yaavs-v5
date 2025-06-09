-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_puntoRecoleccionId_fkey";

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "puntoRecoleccionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_puntoRecoleccionId_fkey" FOREIGN KEY ("puntoRecoleccionId") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
