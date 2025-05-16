-- CreateTable
CREATE TABLE "conceptos_presupuesto" (
    "id" SERIAL NOT NULL,
    "presupuestoId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceptos_presupuesto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "conceptos_presupuesto" ADD CONSTRAINT "conceptos_presupuesto_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
