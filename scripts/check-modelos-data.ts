import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkModelosData() {
  try {
    console.log('=== Verificando datos de Marcas y Modelos ===\n');

    // Verificar marcas
    console.log('1. Verificando marcas...');
    const marcas = await prisma.marcas.findMany({
      orderBy: { nombre: 'asc' }
    });
    console.log(`Marcas encontradas: ${marcas.length}`);
    if (marcas.length > 0) {
      console.log('Primeras 5 marcas:');
      marcas.slice(0, 5).forEach(marca => {
        console.log(`  - ID: ${marca.id}, Nombre: ${marca.nombre}`);
      });
    } else {
      console.log('❌ No hay marcas en la base de datos');
    }

    console.log('\n2. Verificando modelos...');
    const modelos = await prisma.modelos.findMany({
      include: {
        marcas: true
      },
      orderBy: { nombre: 'asc' }
    });
    console.log(`Modelos encontrados: ${modelos.length}`);
    if (modelos.length > 0) {
      console.log('Primeros 5 modelos:');
      modelos.slice(0, 5).forEach(modelo => {
        console.log(`  - ID: ${modelo.id}, Nombre: ${modelo.nombre}, Marca: ${modelo.marcas?.nombre || 'Sin marca'}`);
      });
    } else {
      console.log('❌ No hay modelos en la base de datos');
    }

    // Verificar relación entre marcas y modelos
    console.log('\n3. Verificando relación marca-modelo...');
    if (marcas.length > 0 && modelos.length > 0) {
      const primeraMarca = marcas[0];
      const modelosDePrimeraMarca = await prisma.modelos.findMany({
        where: {
          marca_id: primeraMarca.id
        },
        include: {
          marcas: true
        }
      });
      console.log(`Modelos para la marca "${primeraMarca.nombre}" (ID: ${primeraMarca.id}): ${modelosDePrimeraMarca.length}`);
      if (modelosDePrimeraMarca.length > 0) {
        console.log('Modelos encontrados:');
        modelosDePrimeraMarca.forEach(modelo => {
          console.log(`  - ${modelo.nombre}`);
        });
      } else {
        console.log('❌ No hay modelos para esta marca');
      }
    }

    // Verificar estructura de la tabla modelos
    console.log('\n4. Verificando estructura de la tabla modelos...');
    const modeloEjemplo = await prisma.modelos.findFirst();
    if (modeloEjemplo) {
      console.log('Estructura de un modelo:');
      console.log(JSON.stringify(modeloEjemplo, null, 2));
    }

  } catch (error) {
    console.error('Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModelosData(); 