import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Cargar variables de entorno del archivo .env.migration
const envPath = path.resolve(process.cwd(), '.env.migration');
console.log('Buscando archivo .env.migration en:', envPath);
console.log('¿Existe el archivo?', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('Contenido del archivo .env.migration:');
  console.log(fs.readFileSync(envPath, 'utf8'));
}

// Cargar variables de entorno
dotenv.config({ path: envPath });

// Usar las variables de entorno directamente
const sourceUrl = "postgresql://sergio@localhost:5432/yaavs_db?schema=public";
const targetUrl = process.env.NEON_DATABASE_URL;

console.log('Variables de entorno cargadas:');
console.log('DATABASE_URL:', sourceUrl);
console.log('NEON_DATABASE_URL:', targetUrl);

if (!targetUrl) {
  console.error('Error: La variable de entorno NEON_DATABASE_URL es requerida');
  console.error('Asegúrate de que el archivo .env.migration existe y contiene esta variable');
  process.exit(1);
}

console.log('URL de la base de datos local:', sourceUrl);
console.log('URL de la base de datos Neon:', targetUrl);

// La base de datos local es la fuente
const sourcePrisma = new PrismaClient({
  datasourceUrl: sourceUrl,
  log: ['query', 'info', 'warn', 'error'],
});

// La base de datos Neon es el destino
const targetPrisma = new PrismaClient({
  datasourceUrl: targetUrl,
  log: ['query', 'info', 'warn', 'error'],
});

async function migrateData() {
  try {
    console.log('Iniciando migración de datos...');

    // Verificar conexión a la base de datos local
    try {
      await sourcePrisma.$connect();
      console.log('Conexión exitosa a la base de datos local');
      
      // Verificar usuarios en la base de datos local
      const usuarios = await sourcePrisma.usuario.findMany();
      console.log('Usuarios encontrados en la base de datos local:');
      usuarios.forEach(usuario => {
        console.log(`- ${usuario.email} (${usuario.nombre} ${usuario.apellidoPaterno})`);
      });
    } catch (error) {
      console.error('Error al conectar a la base de datos local:', error);
      return;
    }

    // Verificar conexión a Neon
    try {
      await targetPrisma.$connect();
      console.log('Conexión exitosa a la base de datos Neon');
    } catch (error) {
      console.error('Error al conectar a la base de datos Neon:', error);
      return;
    }

    // Migrar Usuarios
    console.log('Migrando usuarios...');
    const usuarios = await sourcePrisma.usuario.findMany();
    console.log(`Encontrados ${usuarios.length} usuarios en la base de datos local`);
    for (const usuario of usuarios) {
      await targetPrisma.usuario.upsert({
        where: { id: usuario.id },
        update: usuario,
        create: usuario,
      });
    }
    console.log(`${usuarios.length} usuarios migrados`);

    // Migrar Marcas
    console.log('Migrando marcas...');
    const marcas = await sourcePrisma.marca.findMany();
    console.log(`Encontradas ${marcas.length} marcas en la base de datos local`);
    for (const marca of marcas) {
      await targetPrisma.marca.upsert({
        where: { id: marca.id },
        update: marca,
        create: marca,
      });
    }
    console.log(`${marcas.length} marcas migradas`);

    // Migrar Modelos
    console.log('Migrando modelos...');
    const modelos = await sourcePrisma.modelo.findMany();
    console.log(`Encontrados ${modelos.length} modelos en la base de datos local`);
    for (const modelo of modelos) {
      await targetPrisma.modelo.upsert({
        where: { id: modelo.id },
        update: modelo,
        create: modelo,
      });
    }
    console.log(`${modelos.length} modelos migrados`);

    // Migrar Proveedores
    console.log('Migrando proveedores...');
    const proveedores = await sourcePrisma.proveedor.findMany();
    console.log(`Encontrados ${proveedores.length} proveedores en la base de datos local`);
    for (const proveedor of proveedores) {
      await targetPrisma.proveedor.upsert({
        where: { id: proveedor.id },
        update: proveedor,
        create: proveedor,
      });
    }
    console.log(`${proveedores.length} proveedores migrados`);

    // Migrar Tipos de Servicio
    console.log('Migrando tipos de servicio...');
    const tiposServicio = await sourcePrisma.tipoServicio.findMany();
    console.log(`Encontrados ${tiposServicio.length} tipos de servicio en la base de datos local`);
    for (const tipoServicio of tiposServicio) {
      await targetPrisma.tipoServicio.upsert({
        where: { id: tipoServicio.id },
        update: tipoServicio,
        create: tipoServicio,
      });
    }
    console.log(`${tiposServicio.length} tipos de servicio migrados`);

    // Migrar Productos
    console.log('Migrando productos...');
    const productos = await sourcePrisma.producto.findMany();
    console.log(`Encontrados ${productos.length} productos en la base de datos local`);
    for (const producto of productos) {
      await targetPrisma.producto.upsert({
        where: { id: producto.id },
        update: producto,
        create: producto,
      });
    }
    console.log(`${productos.length} productos migrados`);

    console.log('Migración completada exitosamente!');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

migrateData(); 