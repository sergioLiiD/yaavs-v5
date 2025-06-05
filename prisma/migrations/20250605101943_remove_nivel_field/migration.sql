/*
  Warnings:

  - You are about to drop the column `nivel` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "usuarios_roles" DROP CONSTRAINT "usuarios_roles_usuarioId_fkey";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "nivel";

-- DropEnum
DROP TYPE "NivelUsuario";

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
