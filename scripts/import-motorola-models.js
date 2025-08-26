const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Motorola
const MOTOROLA_MODELS = [
  'E13',
  'E14',
  'E20',
  'E22',
  'E22i',
  'E22S',
  'E30',
  'E32',
  'E32S',
  'E40',
  'E5 PLAY GO',
  'E5 PLUS',
  'E6 PLAY',
  'E6I',
  'E6PLAY',
  'E6PLUS',
  'E6S',
  'E7',
  'E7 PLUS',
  'E7 POWER',
  'E7i',
  'E7i POWER',
  'E7PLUS',
  'EDGE',
  'EDGE 20',
  'EDGE 20 LITE',
  'EDGE 20 PRO',
  'EDGE 2021',
  'EDGE 2023',
  'EDGE 30',
  'EDGE 30 NEO',
  'EDGE 30 PRO',
  'EDGE 40',
  'EDGE 40 NEO',
  'EDGE 50 FUSION',
  'EDGE 50 PRO',
  'EDGE S',
  'G PLAY 2021 4G',
  'G POWER 2021',
  'G POWER 2022 4G',
  'G PURE 4G',
  'G STYLUS 2021 5G',
  'G STYLUS 2022',
  'G STYLUS 2022 4G/5G',
  'G STYLUS 5G 2023 ORIG S/M',
  'G04',
  'G04S',
  'G10',
  'G10 PLAY',
  'G100',
  'G13',
  'G14',
  'G20',
  'G200 5G',
  'G22',
  'G23',
  'G24',
  'G24 POWER',
  'G30',
  'G31',
  'G32',
  'G34',
  'G40 FUSION',
  'G41',
  'G42',
  'G50',
  'G50 4G',
  'G50 5G',
  'G51 5G',
  'G52',
  'G53',
  'G54',
  'G55',
  'G5G',
  'G5G 2022 4G',
  'G5G 2023',
  'G6',
  'G6 PLAY/E5',
  'G6 PLUS',
  'G60',
  'G60S',
  'G62',
  'G64',
  'G6PLAY/E5',
  'G6PLUS',
  'G7',
  'G7 PLAY',
  'G7 PLUS',
  'G7 POWER',
  'G71',
  'G71S',
  'G72',
  'G73',
  'G73 5G',
  'G7PLAY',
  'G7POWER',
  'G8',
  'G8 PLAY',
  'G8 PLAY/ONE MACRO',
  'G8 PLUS',
  'G8 POWER',
  'G82',
  'G84',
  'G85',
  'G8PLAY',
  'G8PLUS',
  'G8POWER',
  'G8POWER LITE',
  'G9',
  'G9 PLAY',
  'G9 PLUS',
  'G9 POWER',
  'LITE',
  'ONE',
  'ONE 5G ACE',
  'ONE ATION',
  'ONE FUSION',
  'ONE FUSION PLUS',
  'ONE HYPER',
  'ONE MACRO',
  'ONE VISION',
  'ONE ZOOM',
  'S50 NEO',
  'X4',
  'XT2010',
  'XT2027',
  'XT2131',
  'XT2155',
  'XT2231-2',
  'XT2335-3',
  'Z PLAY',
  'Z2 PLAY',
  'Z3 PLAY'
];

async function importMotorolaModels() {
  const result = {
    marca: 'Motorola',
    totalModelos: MOTOROLA_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Motorola...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Motorola en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Motorola',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Motorola" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of MOTOROLA_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Motorola.`);
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
importMotorolaModels();
