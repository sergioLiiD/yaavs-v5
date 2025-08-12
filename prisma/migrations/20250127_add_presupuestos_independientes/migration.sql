-- CreateTable
CREATE TABLE "presupuestos_independientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "cliente_nombre" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presupuestos_independientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_presupuesto_independiente" (
    "id" SERIAL NOT NULL,
    "presupuesto_independiente_id" INTEGER NOT NULL,
    "producto_id" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "concepto_extra" TEXT,
    "precio_concepto_extra" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_presupuesto_independiente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presupuestos_independientes_usuario_id_idx" ON "presupuestos_independientes"("usuario_id");

-- CreateIndex
CREATE INDEX "productos_presupuesto_independiente_presupuesto_independiente_id_idx" ON "productos_presupuesto_independiente"("presupuesto_independiente_id");

-- CreateIndex
CREATE INDEX "productos_presupuesto_independiente_producto_id_idx" ON "productos_presupuesto_independiente"("producto_id");

-- AddForeignKey
ALTER TABLE "presupuestos_independientes" ADD CONSTRAINT "presupuestos_independientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_presupuesto_independiente" ADD CONSTRAINT "productos_presupuesto_independiente_presupuesto_independiente_id_fkey" FOREIGN KEY ("presupuesto_independiente_id") REFERENCES "presupuestos_independientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_presupuesto_independiente" ADD CONSTRAINT "productos_presupuesto_independiente_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
