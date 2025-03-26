-- CreateTable
CREATE TABLE "inventarios_minimos" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidadMinima" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventarios_minimos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventarios_minimos_productoId_key" ON "inventarios_minimos"("productoId");

-- AddForeignKey
ALTER TABLE "inventarios_minimos" ADD CONSTRAINT "inventarios_minimos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
