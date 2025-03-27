-- CreateTable
CREATE TABLE "reparaciones_frecuentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reparaciones_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasos_reparacion_frecuente" (
    "id" SERIAL NOT NULL,
    "reparacionFrecuenteId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pasos_reparacion_frecuente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_reparacion_frecuente" (
    "id" SERIAL NOT NULL,
    "reparacionFrecuenteId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "conceptoExtra" TEXT,
    "precioConceptoExtra" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_reparacion_frecuente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pasos_reparacion_frecuente" ADD CONSTRAINT "pasos_reparacion_frecuente_reparacionFrecuenteId_fkey" FOREIGN KEY ("reparacionFrecuenteId") REFERENCES "reparaciones_frecuentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_reparacion_frecuente" ADD CONSTRAINT "productos_reparacion_frecuente_reparacionFrecuenteId_fkey" FOREIGN KEY ("reparacionFrecuenteId") REFERENCES "reparaciones_frecuentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_reparacion_frecuente" ADD CONSTRAINT "productos_reparacion_frecuente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
