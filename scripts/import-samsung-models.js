const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Samsung
const SAMSUNG_MODELS = [
  'A01 M',
  'A02',
  'A02S',
  'A03',
  'A03 CORE',
  'A037U',
  'A03S',
  'A04',
  'A045',
  'A04CORE',
  'A04E',
  'A04S',
  'A05',
  'A05S',
  'A06',
  'A065',
  'A10',
  'A107',
  'A10E',
  'A10S',
  'A11',
  'A11 INCELL300+ C/M',
  'A115',
  'A12',
  'A13',
  'A13 4G',
  'A13 5G',
  'A13 LITE',
  'A136B',
  'A14 4G',
  'A14 5G',
  'A145P',
  'A146B',
  'A15 4G(5G)',
  'A20',
  'A207',
  'A20S',
  'A217',
  'A21S',
  'A22 4G',
  'A23 4G',
  'A23 lite',
  'A23 LITE',
  'A24',
  'A24 4G',
  'A25',
  'A25 5G',
  'A30',
  'A30S',
  'A31',
  'A315',
  'A32 4G',
  'A32 5G',
  'A325',
  'A325 4G',
  'A33',
  'A336',
  'A34 5G',
  'A35',
  'A50',
  'A50S',
  'A51',
  'A515',
  'A52',
  'A525',
  'A525 4G',
  'A52S',
  'A53',
  'A536',
  'A54',
  'A546',
  'A55',
  'A70',
  'A70S',
  'A71',
  'A715',
  'A72',
  'A725',
  'A73 5G',
  'A730',
  'A8PLUS',
  'F12',
  'G530',
  'G530 LCD INCELL S/M',
  'G532',
  'HG NOTE10 PLUS',
  'HG NOTE20 ULTRA',
  'HG S20 PLUS',
  'HG S20 ULTRA',
  'HG S21 PLUS',
  'HG S21 ULTRA',
  'HG S22 PLUS',
  'HG S22 ULTRA',
  'HG S23 ULTRA',
  'J4',
  'J4CORE',
  'J4PLUS',
  'J5',
  'J5 PRIME',
  'J5 PRO',
  'J530',
  'J6',
  'J6 PLUS',
  'J610',
  'J6PLUS',
  'J7',
  'J7 NEO',
  'J7 PRIME',
  'J701',
  'J730',
  'J7NEO',
  'J7PRO',
  'J8',
  'M02',
  'M10',
  'M11',
  'M127',
  'M14 5G',
  'M146B',
  'M20',
  'M21',
  'M23',
  'M23 4G',
  'M23 5G',
  'M30',
  'M30 INCELL300+ C/M',
  'M30S',
  'M31',
  'M33',
  'M33 5G',
  'M336B',
  'M34 5G',
  'M53 5G',
  'NOTE10 LITE',
  'NOTE10 PLUS',
  'NOTE20',
  'NOTE20 ULTRA',
  'S10',
  'S10 PLUS',
  'S20 FE',
  'S20 PLUS',
  'S20 ULTRA',
  'S21 PLUS',
  'S21 ULTRA',
  'S22',
  'S22 PLUS',
  'S22 ULTRA',
  'S22 ULTRA SOFT OLED C/M(BOUTIQUE)',
  'S23',
  'S23 ULTRA',
  'S24 ULTRA',
  'S8',
  'S8PLUS',
  'S9',
  'S9 PLUS',
  'SAMA10'
];

async function importSamsungModels() {
  const result = {
    marca: 'Samsung',
    totalModelos: SAMSUNG_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Samsung...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Samsung en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Samsung',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Samsung" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of SAMSUNG_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Samsung.`);
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
importSamsungModels();
