-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoProveedor" ADD VALUE 'DISTRIBUIDOR';
ALTER TYPE "TipoProveedor" ADD VALUE 'FABRICANTE';

-- AlterTable
ALTER TABLE "reparaciones" ADD COLUMN     "fecha_pausa" TIMESTAMP(3),
ADD COLUMN     "fecha_reanudacion" TIMESTAMP(3);
