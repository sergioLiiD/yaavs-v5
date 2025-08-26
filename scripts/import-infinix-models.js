const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de modelos de Infinix
const INFINIX_MODELS = [
  'HOT10 PLAY',
  'HOT30',
  'HOT 30i',
  'Note 30',
  'Note 30 4G',
  'Note 30 PRO',
  'SMART 7',
  'X6515',
  'X669',
  'X678B',
  'X6831',
  'X6833',
  'X688'
];

async function importInfinixModels() {
  const result = {
    marca: 'Infinix',
    totalModelos: INFINIX_MODELS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de modelos Infinix...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Modelos a importar: ${result.totalModelos}`);

    // Buscar la marca Infinix en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Infinix',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Infinix" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of INFINIX_MODELS) {
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos de Infinix.`);
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
importInfinixModels();
