import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function restore() {
  try {
    // Obtener el archivo de respaldo más reciente
    const backupDir = path.join(process.cwd(), 'backups');
    const files = fs.readdirSync(backupDir);
    const latestBackup = files
      .filter(file => file.startsWith('backup_'))
      .sort()
      .reverse()[0];

    if (!latestBackup) {
      throw new Error('No se encontró archivo de respaldo');
    }

    const backupPath = path.join(backupDir, latestBackup);
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Restaurar tipos de servicio
    for (const tipoServicio of backupData.tiposServicio) {
      await prisma.tipoServicio.create({
        data: {
          id: tipoServicio.id,
          nombre: tipoServicio.concepto || tipoServicio.nombre,
          descripcion: tipoServicio.descripcion,
          createdAt: new Date(tipoServicio.createdAt),
          updatedAt: new Date(tipoServicio.updatedAt),
        },
      });
    }
    console.log('Tipos de servicio restaurados');

    // Restaurar marcas
    for (const marca of backupData.marcas) {
      await prisma.marca.create({
        data: {
          id: marca.id,
          nombre: marca.nombre,
          descripcion: marca.descripcion || marca.logo,
          createdAt: new Date(marca.createdAt),
          updatedAt: new Date(marca.updatedAt),
        },
      });
    }
    console.log('Marcas restauradas');

    // Restaurar modelos
    for (const modelo of backupData.modelos) {
      await prisma.modelo.create({
        data: {
          id: modelo.id,
          nombre: modelo.nombre,
          descripcion: modelo.descripcion || modelo.imagen,
          marcaId: modelo.marcaId,
          createdAt: new Date(modelo.createdAt),
          updatedAt: new Date(modelo.updatedAt),
        },
      });
    }
    console.log('Modelos restaurados');

    // Restaurar proveedores
    let proveedorId = 1;
    for (const proveedor of backupData.proveedores) {
      await prisma.proveedor.create({
        data: {
          id: proveedorId++,
          nombre: proveedor.nombre,
          contacto: proveedor.personaResponsable || proveedor.nombre,
          telefono: proveedor.telefono,
          email: proveedor.email,
          direccion: proveedor.direccion,
          notas: `RFC: ${proveedor.rfc}, Banco: ${proveedor.banco}, Cuenta: ${proveedor.cuentaBancaria}, CLABE: ${proveedor.clabeInterbancaria}`,
          banco: proveedor.banco || '',
          clabeInterbancaria: proveedor.clabeInterbancaria || '',
          cuentaBancaria: proveedor.cuentaBancaria || '',
          rfc: proveedor.rfc || '',
          createdAt: new Date(proveedor.createdAt),
          updatedAt: new Date(proveedor.updatedAt),
        },
      });
    }
    console.log('Proveedores restaurados');

    console.log('Restauración completada exitosamente');
  } catch (error) {
    console.error('Error al restaurar los datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restore(); 