import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear usuario admin
  const adminPassword = await hash('password', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      nombre: 'Administrador',
      apellidoPaterno: 'Sistema',
      apellidoMaterno: null,
      passwordHash: adminPassword,
      nivel: 'ADMINISTRADOR',
      activo: true,
    },
  });
  console.log('Usuario admin creado:', admin);

  // Crear marcas
  const marcas = await Promise.all([
    prisma.marca.upsert({
      where: { nombre: 'Apple' },
      update: {},
      create: { nombre: 'Apple', activo: true },
    }),
    prisma.marca.upsert({
      where: { nombre: 'Samsung' },
      update: {},
      create: { nombre: 'Samsung', activo: true },
    }),
    prisma.marca.upsert({
      where: { nombre: 'Xiaomi' },
      update: {},
      create: { nombre: 'Xiaomi', activo: true },
    }),
    prisma.marca.upsert({
      where: { nombre: 'Huawei' },
      update: {},
      create: { nombre: 'Huawei', activo: true },
    }),
    prisma.marca.upsert({
      where: { nombre: 'Motorola' },
      update: {},
      create: { nombre: 'Motorola', activo: true },
    }),
  ]);
  console.log('Marcas creadas:', marcas.length);

  // Crear modelos
  const models = await Promise.all([
    prisma.modelo.create({
      data: {
        nombre: 'iPhone 15',
        descripcion: 'Última generación de iPhone',
        marcaId: marcas[0].id,
        activo: true,
      },
    }),
    prisma.modelo.create({
      data: {
        nombre: 'iPhone 14',
        descripcion: 'Generación anterior de iPhone',
        marcaId: marcas[0].id,
        activo: true,
      },
    }),
    prisma.modelo.create({
      data: {
        nombre: 'Galaxy S23',
        descripcion: 'Gama alta de Samsung',
        marcaId: marcas[1].id,
        activo: true,
      },
    }),
    prisma.modelo.create({
      data: {
        nombre: 'Galaxy A54',
        descripcion: 'Gama media de Samsung',
        marcaId: marcas[1].id,
        activo: true,
      },
    }),
    prisma.modelo.create({
      data: {
        nombre: 'Redmi Note 12',
        descripcion: 'Gama media de Xiaomi',
        marcaId: marcas[2].id,
        activo: true,
      },
    }),
  ]);
  console.log('Modelos creados:', models.length);

  // Crear estados de reparación
  const estados = await Promise.all([
    prisma.estatusReparacion.create({
      data: {
        nombre: 'Recepción del equipo',
        descripcion: 'Fase inicial cuando se recibe el dispositivo',
        orden: 1,
        color: '#3498db', // Azul
        activo: true,
      },
    }),
    prisma.estatusReparacion.create({
      data: {
        nombre: 'En espera de inspección',
        descripcion: 'El dispositivo está en cola para ser revisado',
        orden: 2,
        color: '#f39c12', // Naranja
        activo: true,
      },
    }),
    prisma.estatusReparacion.create({
      data: {
        nombre: 'Diagnóstico',
        descripcion: 'Determinando el problema del dispositivo',
        orden: 3,
        color: '#9b59b6', // Morado
        activo: true,
      },
    }),
    prisma.estatusReparacion.create({
      data: {
        nombre: 'Presupuesto',
        descripcion: 'Enviando presupuesto al cliente',
        orden: 4,
        color: '#1abc9c', // Verde-Azulado
        activo: true,
      },
    }),
    prisma.estatusReparacion.create({
      data: {
        nombre: 'En reparación',
        descripcion: 'Trabajando en la solución del problema',
        orden: 5,
        color: '#e74c3c', // Rojo
        activo: true,
      },
    }),
    prisma.estatusReparacion.create({
      data: {
        nombre: 'Pruebas',
        descripcion: 'Verificando el correcto funcionamiento',
        orden: 6,
        color: '#f1c40f', // Amarillo
        activo: true,
      },
    }),
    prisma.estatusReparacion.create({
      data: {
        nombre: 'Listo para entrega',
        descripcion: 'Reparación completada',
        orden: 7,
        color: '#2ecc71', // Verde
        activo: true,
      },
    }),
  ]);
  console.log('Estados de reparación creados:', estados.length);

  // Crear tipos de servicio
  const servicios = await Promise.all([
    prisma.tipoServicio.create({
      data: {
        concepto: 'Reparación de pantalla',
        descripcion: 'Reemplazo o reparación de pantallas dañadas',
        activo: true,
      },
    }),
    prisma.tipoServicio.create({
      data: {
        concepto: 'Reparación de batería',
        descripcion: 'Reemplazo de baterías con mal funcionamiento',
        activo: true,
      },
    }),
    prisma.tipoServicio.create({
      data: {
        concepto: 'Reparación de cámara',
        descripcion: 'Reparación de cámaras frontales o traseras',
        activo: true,
      },
    }),
    prisma.tipoServicio.create({
      data: {
        concepto: 'Reparación de placa base',
        descripcion: 'Reparación de componentes de la placa base',
        activo: true,
      },
    }),
    prisma.tipoServicio.create({
      data: {
        concepto: 'Actualización de software',
        descripcion: 'Actualización o reinstalación del sistema operativo',
        activo: true,
      },
    }),
  ]);
  console.log('Tipos de servicio creados:', servicios.length);

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