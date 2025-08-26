const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createInfinixBrand() {
  try {
    console.log('🏷️  Verificando si existe la marca Infinix...\n');

    // Buscar si ya existe la marca Infinix
    const marcaExistente = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Infinix',
          mode: 'insensitive'
        }
      }
    });

    if (marcaExistente) {
      console.log(`✅ La marca "Infinix" ya existe (ID: ${marcaExistente.id})`);
      return marcaExistente;
    }

    // Crear la marca Infinix
    const nuevaMarca = await prisma.marcas.create({
      data: {
        nombre: 'Infinix',
        descripcion: 'Marca de smartphones y dispositivos móviles',
        updated_at: new Date()
      }
    });

    console.log(`✅ Marca "Infinix" creada exitosamente (ID: ${nuevaMarca.id})`);
    return nuevaMarca;

  } catch (error) {
    console.error('❌ Error al crear la marca Infinix:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
createInfinixBrand();
