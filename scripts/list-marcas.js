const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listMarcas() {
  try {
    console.log('🏷️  Listando todas las marcas en la base de datos...\n');

    const marcas = await prisma.marcas.findMany({
      orderBy: {
        nombre: 'asc'
      },
      include: {
        _count: {
          select: {
            modelos: true
          }
        }
      }
    });

    if (marcas.length === 0) {
      console.log('❌ No hay marcas registradas en la base de datos.');
      return;
    }

    console.log(`📊 Total de marcas: ${marcas.length}\n`);
    console.log('ID | Nombre | Modelos');
    console.log('-'.repeat(40));

    marcas.forEach(marca => {
      console.log(`${marca.id.toString().padStart(2)} | ${marca.nombre.padEnd(15)} | ${marca._count.modelos}`);
    });

    console.log('\n💡 Para importar modelos, asegúrate de que la marca exista en esta lista.');

  } catch (error) {
    console.error('❌ Error al listar marcas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listMarcas();
