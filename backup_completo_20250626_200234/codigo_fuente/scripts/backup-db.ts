import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    // Crear directorio de backups si no existe
    const backupDir = path.join(process.cwd(), 'backups', 'neon');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Obtener todas las tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;

    const backupData: Record<string, unknown[]> = {};

    // Para cada tabla, obtener sus datos
    for (const table of tables as { table_name: string }[]) {
      const tableName = table.table_name;
      const data = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`) as unknown[];
      backupData[tableName] = data;
    }

    // Guardar el backup en un archivo JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_neon_${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`Backup creado exitosamente en: ${backupPath}`);

  } catch (error) {
    console.error('Error al crear el backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase(); 