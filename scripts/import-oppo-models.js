const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Oppo
const OPPO_MODELS = [
  '1+N100',
  '1+NORD CE2',
  '11X',
  '8I',
  '9i',
  'A1 5G',
  'A1 PRO',
  'A11',
  'A11K',
  'A11S',
  'A11X',
  'A12',
  'A12s',
  'A15',
  'A15S',
  'A16',
  'A16E',
  'A16K',
  'A16S',
  'A17',
  'A17K',
  'A2 5G',
  'A31',
  'A31 2020',
  'A32',
  'A33',
  'A35',
  'A38',
  'A5 2020',
  'A52',
  'A52 4G',
  'A53',
  'A53 2020',
  'A53 4G',
  'A53S',
  'A54',
  'A54 4G',
  'A54S',
  'A55 4G',
  'A56',
  'A57',
  'A57E',
  'A57S',
  'A58 4G',
  'A58X 5G',
  'A5S',
  'A7',
  'A72',
  'A72 4G',
  'A73 5G',
  'A74 4G',
  'A77',
  'A78 4G',
  'A79 5G',
  'A7n',
  'A8',
  'A9',
  'A9 2020',
  'A92',
  'A92 4G',
  'A93 4G',
  'A93 5G',
  'A94 4G',
  'A95 4G',
  'Ax5S',
  'AX7',
  'C11',
  'C11 2021',
  'C15 CONFIGRACION BAJA',
  'C20',
  'C21',
  'C21Y',
  'C25',
  'C25S',
  'C25Y',
  'C30',
  'C30i',
  'C30S',
  'C33',
  'C35',
  'C36',
  'C3i',
  'C50i',
  'C51',
  'C51S',
  'C53',
  'C60',
  'C67',
  'F19 4G',
  'F19S 4G',
  'F21PRO 4G',
  'F21PRO 5G',
  'F21S PRO 4G',
  'F21S PRO4G',
  'F23',
  'FIND X3 LITE',
  'FIND X5 LI',
  'FIND X5 LITE 5G',
  'K10 5G',
  'K11X 5G',
  'K7X',
  'K9 5G',
  'K9PRO 5G',
  'N20SE',
  'N55',
  'Narzo N53',
  'Narzo10A',
  'NARZO20 PRO',
  'NARZO30 4G',
  'NARZO30 PRO',
  'NARZO50A',
  'narzo50A',
  'Note50',
  'NOTE50',
  'prime C3',
  'prime C5',
  'REALME',
  'realme 5s',
  'REALME C11 2020',
  'REALME C12',
  'REALME C17',
  'realme C3',
  'REALME C55',
  'REALME Q2',
  'REALME V5',
  'REALME11 5G',
  'Realme3',
  'Realme3i',
  'realme5',
  'realme5i',
  'realme5s',
  'REALME6',
  'realme6i',
  'REALME6I IZQUIERDO',
  'REALME6S',
  'REALME7',
  'REALME7 5G',
  'REALME7 PRO 04',
  'REALME7I',
  'realmeC3',
  'RENO 4SE',
  'RENO 5F',
  'RENO 5Z',
  'RENO 6Z',
  'RENO10 5G',
  'RENO11 5G',
  'Reno4se',
  'RENO5',
  'RENO5 4G(5G)',
  'RENO5 LITE',
  'Reno5F',
  'RENO5K',
  'Reno5Z',
  'RENO6 4G(5G)',
  'RENO6 LITE',
  'Reno6Z',
  'RENO7 4G',
  'RENO7 4G(5G)',
  'RENO7 5G',
  'RENO7 LITE',
  'RENO7 LITE 5G',
  'RENO7SE 5G',
  'RENO7Z',
  'RENO8 4G(5G)',
  'RENO8 LITE',
  'RENO8T',
  'RENO8T 5G',
  'RENO9',
  'V50',
  'V50S A98 4G'
];

async function importOppoModels() {
  const result = {
    marca: 'Oppo',
    totalModelos: OPPO_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Oppo...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Oppo en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Oppo',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Oppo" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of OPPO_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Oppo.`);
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
importOppoModels();
