-- DropForeignKey
ALTER TABLE "piezas_reparacion" DROP CONSTRAINT "piezas_reparacion_piezaId_fkey";

-- AlterTable
ALTER TABLE "piezas_reparacion" ALTER COLUMN "piezaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_piezaId_fkey" FOREIGN KEY ("piezaId") REFERENCES "piezas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
