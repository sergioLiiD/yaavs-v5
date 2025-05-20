-- DropForeignKey
ALTER TABLE "entradas_almacen" DROP CONSTRAINT "entradas_almacen_proveedorId_fkey";

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
