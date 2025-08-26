const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Vivo
const VIVO_MODELS = [
  'Y95',
  'Y93S',
  'Y93',
  'Y91I',
  'Y91C',
  'Y91',
  'Y90',
  'Y76S 5G',
  'Y76S',
  'Y76 5G',
  'Y74S 5G',
  'Y74S',
  'Y73',
  'Y72 5G',
  'Y71',
  'Y53S',
  'Y52S',
  'Y51 2020',
  'Y50',
  'Y3s 2021',
  'Y3S 2020',
  'Y3S',
  'Y36 5G',
  'Y36 4G',
  'Y33T',
  'Y33S 5G',
  'Y33S',
  'Y33E',
  'Y33',
  'Y32',
  'Y31S',
  'Y31 2020',
  'Y30i',
  'Y30G',
  'Y30',
  'Y3',
  'Y22S',
  'Y22',
  'Y21T',
  'Y21G',
  'Y21E',
  'Y21A',
  'Y21',
  'Y20sg',
  'Y20S',
  'Y20i',
  'Y20 2021',
  'Y20',
  'Y1S',
  'Y17S',
  'Y17',
  'Y16',
  'Y15S',
  'Y15A',
  'Y15',
  'Y12s',
  'Y12',
  'Y11s',
  'Y11',
  'Y02S',
  'Y01',
  'X2058(UNIVERSAL)',
  'V30LITE 5G',
  'V27E',
  'V25',
  'V21',
  'V2058',
  'V12s 2021',
  'V12A',
  'U3X',
  'U10',
  'U1',
  'T1 PRO',
  'T1 5G',
  'S9E',
  '1935'
];

async function importVivoModels() {
  const result = {
    marca: 'Vivo',
    totalModelos: VIVO_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Vivo...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Vivo en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Vivo',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Vivo" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of VIVO_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Vivo.`);
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
importVivoModels();
