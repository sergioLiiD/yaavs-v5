-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
