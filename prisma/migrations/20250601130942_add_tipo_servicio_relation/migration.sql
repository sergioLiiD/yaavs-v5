-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
