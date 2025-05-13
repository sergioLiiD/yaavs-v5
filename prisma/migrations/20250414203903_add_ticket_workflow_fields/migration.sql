-- AlterTable
ALTER TABLE "Reparacion" ADD COLUMN     "checklistPostReparacion" JSONB,
ADD COLUMN     "checklistRecepcion" JSONB;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "fechaFinDiagnostico" TIMESTAMP(3),
ADD COLUMN     "fechaFinReparacion" TIMESTAMP(3),
ADD COLUMN     "fechaInicioDiagnostico" TIMESTAMP(3),
ADD COLUMN     "fechaInicioReparacion" TIMESTAMP(3);
