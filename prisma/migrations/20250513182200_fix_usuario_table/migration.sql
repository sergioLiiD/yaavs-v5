/*
  Warnings:

  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "entradas_almacen" DROP CONSTRAINT "entradas_almacen_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "salidas_almacen" DROP CONSTRAINT "salidas_almacen_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_creadorId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tecnicoAsignadoId_fkey";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "passwordHash" TEXT NOT NULL,
    "nivel" "NivelUsuario" NOT NULL DEFAULT 'TECNICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
