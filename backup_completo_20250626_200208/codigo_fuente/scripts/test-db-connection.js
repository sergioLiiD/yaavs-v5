const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:ytMhSBmrYqPZIWPTsaTPCzAcAiiVzONZ@postgres.railway.internal:5432/railway"
      }
    }
  });
  
  try {
    console.log('Intentando conectar a la base de datos...');
    
    // Intentar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Conexión exitosa:', result);
    
    // Listar las tablas existentes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tablas existentes:', tables);
    
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 