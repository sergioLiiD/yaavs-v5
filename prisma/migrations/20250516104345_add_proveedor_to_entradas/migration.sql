-- Agregar columna proveedorId a entradas_almacen (opcional temporalmente)
ALTER TABLE "entradas_almacen" ADD COLUMN "proveedorId" INTEGER;

-- Agregar foreign key
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 