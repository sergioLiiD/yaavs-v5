/*
  Warnings:

  - You are about to drop the column `diagnostico` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaDiagnostico` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaPresupuesto` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `piezasNecesarias` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `presupuesto` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `saludBateria` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `versionSO` on the `Reparacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reparacion" DROP COLUMN "diagnostico",
DROP COLUMN "fechaDiagnostico",
DROP COLUMN "fechaPresupuesto",
DROP COLUMN "piezasNecesarias",
DROP COLUMN "presupuesto",
DROP COLUMN "saludBateria",
DROP COLUMN "versionSO",
ADD COLUMN     "checklist" JSONB,
ADD COLUMN     "fechaPausa" TIMESTAMP(3),
ADD COLUMN     "fechaReanudacion" TIMESTAMP(3),
ADD COLUMN     "fotos" TEXT[],
ADD COLUMN     "videos" TEXT[];
