-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "creadoPorId" INTEGER,
ALTER COLUMN "tipoRegistro" SET DEFAULT 'REGISTRO_TIENDA';

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
