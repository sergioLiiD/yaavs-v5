const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Xiaomi
const XIAOMI_MODELS = [
  '10 INDIA',
  '11PRIME',
  '9 PRIME',
  'A1',
  'A1 PLUS',
  'A2',
  'A2+',
  'A2PLUS',
  'CC9PRO',
  'CMI 10T LITE',
  'K20',
  'K30S',
  'M6 PRO',
  'MI 10',
  'MI 10 LITE',
  'MI 10T',
  'MI 10T PRO',
  'MI 11 i',
  'MI 11 LITE 4G/5G',
  'MI 11 X',
  'MI 11T',
  'MI 11T PRO',
  'MI 12T',
  'MI 12T PRO',
  'MI 9',
  'MI 9T',
  'MI 9T PRO',
  'MI A1/5X',
  'MI A2/6X',
  'MI A3',
  'MI A3/CC9E',
  'MI NOTE10',
  'MI10 LITE',
  'MI10T',
  'MI10T PRO',
  'MI11 i',
  'MI11 LITE 4G/5G',
  'MI11 X',
  'MI11T',
  'MI11T PRO',
  'MI13T',
  'MI13T PRO',
  'MI9',
  'MI9 POWER',
  'MI9T PRO',
  'NOTE 13 4G',
  'NOTE10LITE',
  'NOTE10PRO',
  'NOTE10PRO MAX',
  'NOTE10S 5G',
  'NOTE10T',
  'NOTE10X',
  'NOTE11 E',
  'NOTE11 R',
  'NOTE11 SE',
  'NOTE11PRO',
  'NOTE11PRO LIUS',
  'Note11S',
  'NOTE12PRO 4G',
  'NOTE12S',
  'NOTE9 4G',
  'NOTE9PRO 5G',
  'POCO C3',
  'POCO C31',
  'POCO C40',
  'POCO C50',
  'POCO C65',
  'POCO F3',
  'POCO F4',
  'POCO M3',
  'POCO M3 PRO',
  'POCO M4',
  'POCO M4 PRO 4G',
  'POCO M4 PRO 5G',
  'POCO M4/M5',
  'POCO M5',
  'POCO M5S',
  'POCO X3',
  'POCO X3 GT',
  'POCO X3 PRO',
  'POCO X3/X3 PRO',
  'POCO X4 GT',
  'POCO X4PRO',
  'POCO X5',
  'REDMI 10',
  'REDMI 10 4G',
  'REDMI 10 5G',
  'REDMI 10 POWER',
  'REDMI 10A',
  'REDMI 10C',
  'REDMI 10X',
  'REDMI 12',
  'REDMI 12C',
  'REDMI 13C',
  'REDMI 14C',
  'REDMI 8',
  'REDMI 8A',
  'REDMI 9',
  'REDMI 9 PRIME',
  'REDMI 9A',
  'REDMI 9AT',
  'REDMI 9C',
  'REDMI 9I',
  'REDMI 9T',
  'REDMI A1',
  'REDMI A1+',
  'REDMI A3',
  'REDMI NOTE 10 4G',
  'REDMI NOTE 10 LITE',
  'REDMI NOTE 10 PRO',
  'REDMI NOTE 10 PRO MAX',
  'REDMI NOTE 10S',
  'REDMI NOTE 11',
  'REDMI NOTE 11 4G',
  'REDMI NOTE 11 PLUS',
  'REDMI NOTE 11 PRO',
  'REDMI NOTE 11S',
  'REDMI NOTE 11T PRO',
  'REDMI NOTE 12 4G',
  'REDMI NOTE 12 5G',
  'REDMI NOTE 12s',
  'REDMI NOTE 13 PRO 4G',
  'REDMI NOTE 7',
  'REDMI NOTE 7 PRO',
  'REDMI NOTE 8',
  'REDMI NOTE 8 PRO',
  'REDMI NOTE 9',
  'REDMI NOTE 9 4G',
  'REDMI NOTE 9S',
  'REDMI NOTE 12 PRO 5G',
  'REDMI NOTE10 4G',
  'REDMI NOTE10 5G',
  'REDMI NOTE10 PRO',
  'REDMI NOTE10 PRO MAX',
  'REDMI NOTE10PRO',
  'REDMI NOTE10PRO 5G',
  'REDMI NOTE10S',
  'REDMI NOTE10X',
  'REDMI NOTE11 4G',
  'REDMI NOTE11 5G',
  'REDMI NOTE11 PLUS',
  'REDMI NOTE11 PRO',
  'REDMI NOTE11S',
  'REDMI NOTE11T PRO',
  'REDMI NOTE12 4G',
  'REDMI NOTE12 4G/5G',
  'REDMI NOTE12 5G',
  'REDMI NOTE12 PRO 5G',
  'REDMI NOTE12PRO 4G',
  'REDMI NOTE12S',
  'REDMI NOTE12T PRO',
  'REDMI NOTE13 5G',
  'REDMI NOTE7',
  'REDMI NOTE7 PRO',
  'REDMI NOTE8',
  'REDMI NOTE8 PRO',
  'REDMI NOTE9',
  'REDMI NOTE9 PRO',
  'REDMI NOTE9S',
  'REDMI POCO X6PRO',
  'REDMI10 5G'
];

async function importXiaomiModels() {
  const result = {
    marca: 'Xiaomi',
    totalModelos: XIAOMI_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Xiaomi...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Xiaomi en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Xiaomi',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Xiaomi" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of XIAOMI_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Xiaomi.`);
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
importXiaomiModels();
