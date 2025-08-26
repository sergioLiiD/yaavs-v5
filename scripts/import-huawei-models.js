const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Huawei
const HUAWEI_MODELS = [
  'ANE LX3',
  'MATE 10',
  'MATE 20 LITE',
  'MATE 20 PRO',
  'MATE 40 E PRO',
  'MATE 40 PRO',
  'MATE 40 PRO +',
  'MATE 9',
  'MATE 10 LITE',
  'MATE 10 PRO',
  'MATE 20',
  'MATE 20 LITE',
  'MATE 20 PRO',
  'MatePad C3',
  'MatePad C5e',
  'MatePad Pro',
  'MatePad Pro 5G',
  'MatePad SE',
  'MediaPad M5',
  'MediaPad M5 lite',
  'MediaPad M5 Pro',
  'MediaPad M6',
  'MediaPad T5',
  'NOVA 10',
  'NOVA 10 SE',
  'NOVA 11 i',
  'NOVA 11 SE',
  'NOVA 12 SE',
  'NOVA 2 Lite',
  'NOVA 2 Plus',
  'NOVA 3',
  'NOVA 3e',
  'NOVA 3i',
  'NOVA 4E',
  'NOVA 5i',
  'NOVA 5T',
  'NOVA 6 SE',
  'NOVA 8',
  'NOVA 8i',
  'NOVA 9',
  'NOVA 9 SE',
  'NOVA Y60',
  'NOVA Y70',
  'NOVA Y71',
  'NOVA Y70 PLUS',
  'NOVA Y90',
  'NOVA10 SE',
  'P SMART +',
  'P SMART 2018',
  'P SMART 2019',
  'P SMART 2020',
  'P SMART 2021',
  'P SMART PRO',
  'P SMART S',
  'P SMART Z',
  'P10',
  'P10 Plus',
  'P20',
  'P20 LITE',
  'P20 PRO',
  'P30',
  'P30 LITE',
  'P30 PRO',
  'P40 Lite',
  'P40 LITE 4G',
  'P40 LITE E',
  'P40 PRO',
  'P50 E',
  'P50 LITE',
  'P50 PRO',
  'P9 Lite 2017',
  'Watch D',
  'Watch GT 2',
  'Watch GT 2 Pro',
  'Watch GT 2e',
  'Watch GT 3',
  'Watch GT Runner',
  'Y5 2018',
  'Y5 2019',
  'Y6 2018',
  'Y6 2019',
  'Y6P',
  'Y6S',
  'Y7 2018',
  'Y7 2019',
  'Y7 Prime',
  'Y7 Prime 2018',
  'Y7A',
  'Y7P',
  'Y7S',
  'Y8P',
  'Y8S',
  'Y9 2018',
  'Y9 2019',
  'Y9 PRIME',
  'Y9 prime 2019',
  'Y9A',
  'Y9P',
  'Y9S'
];

async function importHuaweiModels() {
  const result = {
    marca: 'Huawei',
    totalModelos: HUAWEI_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Huawei...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Huawei en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Huawei',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Huawei" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of HUAWEI_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Huawei.`);
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
importHuaweiModels();
