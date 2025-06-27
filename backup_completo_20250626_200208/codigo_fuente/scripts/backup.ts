import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backup() {
  try {
    // Obtener datos de las tablas
    const tiposServicio = await prisma.tipoServicio.findMany();
    const marcas = await prisma.marca.findMany();
    const modelos = await prisma.modelo.findMany();
    const proveedores = await prisma.proveedor.findMany();

    // Crear objeto con todos los datos
    const backup = {
      tiposServicio,
      marcas,
      modelos,
      proveedores,
    };

    // Crear directorio de respaldo si no existe
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Guardar datos en archivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`Respaldo creado exitosamente en: ${backupPath}`);
  } catch (error) {
    console.error('Error al crear el respaldo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup(); 