/*
  Warnings:

  - You are about to drop the column `categoria` on the `permisos` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `permisos` will be added. If there are existing duplicate values, this will fail.
  - Made the column `descripcion` on table `permisos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `descripcion` on table `roles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "roles_permisos" DROP CONSTRAINT "roles_permisos_permisoId_fkey";

-- DropForeignKey
ALTER TABLE "roles_permisos" DROP CONSTRAINT "roles_permisos_rolId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios_roles" DROP CONSTRAINT "usuarios_roles_rolId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios_roles" DROP CONSTRAINT "usuarios_roles_usuarioId_fkey";

-- AlterTable
ALTER TABLE "permisos" DROP COLUMN "categoria",
ALTER COLUMN "descripcion" SET NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "activo",
ALTER COLUMN "descripcion" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "nivel" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "permisos_nombre_key" ON "permisos"("nombre");

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
