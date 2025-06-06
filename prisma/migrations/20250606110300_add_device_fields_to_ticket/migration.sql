-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "capacidad" TEXT,
ADD COLUMN     "codigoDesbloqueo" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "fechaCompra" TIMESTAMP(3),
ADD COLUMN     "redCelular" TEXT;
