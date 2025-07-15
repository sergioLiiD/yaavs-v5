const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testMarcas() {
  try {
    console.log('Probando conexión a la base de datos...');
    
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conexión exitosa');
    
    // Probar obtener marcas
    console.log('Probando obtener marcas...');
    const marcas = await prisma.marcas.findMany();
    console.log('✅ Marcas obtenidas:', marcas.length);
    
    // Probar crear una marca de prueba
    console.log('Probando crear marca de prueba...');
    const nuevaMarca = await prisma.marcas.create({
      data: {
        nombre: 'TEST_MARCA_' + Date.now(),
        descripcion: 'Marca de prueba',
        updated_at: new Date()
      }
    });
    console.log('✅ Marca creada:', nuevaMarca);
    
    // Eliminar la marca de prueba
    await prisma.marcas.delete({
      where: { id: nuevaMarca.id }
    });
    console.log('✅ Marca de prueba eliminada');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Código:', error.code);
    console.error('Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testMarcas(); 