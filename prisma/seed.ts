import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Eliminar datos existentes en orden para respetar las restricciones de clave foránea
  await prisma.precioVenta.deleteMany();
  await prisma.inventarioMinimo.deleteMany();
  await prisma.fotoProducto.deleteMany();
  await prisma.salidaAlmacen.deleteMany();
  await prisma.entradaAlmacen.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.modelo.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.tipoServicio.deleteMany();
  await prisma.estatusReparacion.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear usuario admin
  const adminUser = await prisma.usuario.create({
    data: {
      email: 'sergio@hoom.mx',
      nombre: 'Sergio',
      apellidoPaterno: 'Hoom',
      passwordHash: await hash('whoS5un0%', 10),
      nivel: 'ADMINISTRADOR',
    },
  });
  console.log('Usuario admin creado:', adminUser);

  // Crear proveedores
  const proveedores = await Promise.all([
    prisma.proveedor.create({
      data: {
        nombre: 'Apple México',
        tipo: 'MORAL',
        rfc: 'APL123456789',
        email: 'ventas@apple.com.mx',
        contacto: 'Juan Pérez',
        telefono: '5555555555',
        banco: 'BBVA',
        clabeInterbancaria: '012345678901234567',
        cuentaBancaria: '1234567890',
      },
    }),
    prisma.proveedor.create({
      data: {
        nombre: 'Samsung México',
        tipo: 'MORAL',
        rfc: 'SAM123456789',
        email: 'ventas@samsung.com.mx',
        contacto: 'María López',
        telefono: '5555555556',
        banco: 'Santander',
        clabeInterbancaria: '012345678901234568',
        cuentaBancaria: '1234567891',
      },
    }),
  ]);
  console.log('Proveedores creados:', proveedores.length);

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 