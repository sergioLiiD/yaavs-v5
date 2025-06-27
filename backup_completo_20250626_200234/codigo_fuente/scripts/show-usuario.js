const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar el esquema exacto de la tabla Usuario
    const tableInfo = await prisma.$queryRaw`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'Usuario'
    `;
    console.log('Información de la tabla Usuario:', tableInfo);

    // Verificar los esquemas disponibles
    const schemas = await prisma.$queryRaw`
      SELECT DISTINCT table_schema 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    `;
    console.log('\nEsquemas disponibles:', schemas);

    // Intentar consultar la tabla Usuario con el esquema explícito
    console.log('\nIntentando consultar la tabla Usuario...');
    const usuarios = await prisma.$queryRawUnsafe('SELECT * FROM public."Usuario"');
    console.log('\nUsuarios encontrados:', usuarios);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 