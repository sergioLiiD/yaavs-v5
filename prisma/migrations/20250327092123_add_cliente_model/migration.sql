-- DropIndex
DROP INDEX "Cliente_email_key";

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "rfc" TEXT,
ALTER COLUMN "calle" DROP NOT NULL,
ALTER COLUMN "numeroExterior" DROP NOT NULL,
ALTER COLUMN "colonia" DROP NOT NULL,
ALTER COLUMN "ciudad" DROP NOT NULL,
ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "codigoPostal" DROP NOT NULL;

-- CreateTable
CREATE TABLE "precios_venta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "precio_compra_promedio" DOUBLE PRECISION NOT NULL,
    "precio_venta" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "precios_venta_pkey" PRIMARY KEY ("id")
);
