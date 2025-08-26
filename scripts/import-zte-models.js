const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de ZTE
const ZTE_MODELS = [
  'A3 2020',
  'A31',
  'A34/A54',
  'A5 2020',
  'A51',
  'A52',
  'A52 LITE',
  'A52/A72',
  'A53',
  'A53PLUS',
  'A54',
  'A7 2020',
  'A71',
  'A72 4G',
  'A72S 5G',
  'A7S 2020',
  'AXON 11',
  'AXON 20',
  'AXON 30',
  'AXON 30 PRO',
  'AXON 40 LITE',
  'AXON 40 PRO',
  'AXON 40SE',
  'AXON 50 LITE',
  'AXON 60',
  'AXON 60 LITE',
  'L210',
  'NOBIA N41',
  'V SMART/2050',
  'V10',
  'V10 VITA',
  'V20',
  'V20 SMART 2050',
  'V20 SMART 8010',
  'V2020 5G',
  'V2020 VITA',
  'V30',
  'V30 VITA',
  'V40',
  'V40 PRO',
  'V40 SMART',
  'V40 VITA',
  'V40S SMART',
  'V41 SMART',
  'V41S SMART',
  'V50 SMART',
  'V9',
  'V9 LITE'
];

async function importZTEModels() {
  const result = {
    marca: 'ZTE',
    totalModelos: ZTE_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos ZTE...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca ZTE en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'ZTE',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "ZTE" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of ZTE_MODELS) {
      try {
        // Verificar si el modelo ya existe
        const modeloExistente = await prisma.modelos.findFirst({
          where: {
            nombre: {
              equals: modeloNombre,
              mode: 'insensitive'
            },
            marca_id: marca.id
          }
        });

        if (modeloExistente) {
          console.log(`⚠️  Modelo duplicado: ${modeloNombre}`);
          result.duplicados++;
          continue;
        }

        // Crear el modelo
        const nuevoModelo = await prisma.modelos.create({
          data: {
            nombre: modeloNombre,
            marca_id: marca.id,
            updated_at: new Date()
          }
        });

        console.log(`✅ Modelo creado: ${modeloNombre} (ID: ${nuevoModelo.id})`);
        result.creados++;

      } catch (error) {
        const errorMsg = `Error al crear modelo "${modeloNombre}": ${error.message || 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        result.errores.push(errorMsg);
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
    console.log('='.repeat(50));
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Total de modelos: ${result.totalModelos}`);
    console.log(`✅ Modelos creados: ${result.creados}`);
    console.log(`⚠️  Modelos duplicados: ${result.duplicados}`);
    console.log(`❌ Errores: ${result.errores.length}`);

    if (result.errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      result.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (result.creados > 0) {
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de ZTE.`);
    } else {
      console.log('\n⚠️  No se crearon nuevos modelos (posiblemente todos eran duplicados).');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
importZTEModels();
