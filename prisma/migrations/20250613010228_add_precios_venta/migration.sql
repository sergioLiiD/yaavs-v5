-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_tipo_servicio_id_fkey";

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "garantia_valor" DROP NOT NULL,
ALTER COLUMN "garantia_valor" DROP DEFAULT,
ALTER COLUMN "garantia_unidad" DROP NOT NULL,
ALTER COLUMN "tipo_servicio_id" DROP NOT NULL,
ALTER COLUMN "stock_maximo" DROP NOT NULL,
ALTER COLUMN "stock_maximo" DROP DEFAULT,
ALTER COLUMN "stock_minimo" DROP NOT NULL,
ALTER COLUMN "stock_minimo" DROP DEFAULT;

-- CreateTable
CREATE TABLE "precios_venta" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "precio_compra_promedio" DOUBLE PRECISION NOT NULL,
    "precio_venta" DOUBLE PRECISION NOT NULL,
    "producto_id" INTEGER,
    "servicio_id" INTEGER,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "precios_venta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_venta" ADD CONSTRAINT "precios_venta_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_venta" ADD CONSTRAINT "precios_venta_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
