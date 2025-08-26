import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ImportResult {
  marca: string;
  totalModelos: number;
  creados: number;
  duplicados: number;
  errores: string[];
}

async function importModelsFromFile(filePath: string): Promise<ImportResult> {
  const result: ImportResult = {
    marca: '',
    totalModelos: 0,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log(`📁 Leyendo archivo: ${filePath}`);
    
    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      throw new Error('El archivo está vacío');
    }

    // La primera línea es el nombre de la marca
    const marcaNombre = lines[0];
    result.marca = marcaNombre;
    
    // Las líneas restantes son los modelos
    const modelos = lines.slice(1);
    result.totalModelos = modelos.length;

    console.log(`🏷️  Marca: ${marcaNombre}`);
    console.log(`📱 Modelos a importar: ${modelos.length}`);

    // Buscar la marca en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: marcaNombre,
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error(`La marca "${marcaNombre}" no existe en la base de datos`);
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada modelo
    for (const modeloNombre of modelos) {
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
        const errorMsg = `Error al crear modelo "${modeloNombre}": ${error instanceof Error ? error.message : 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        result.errores.push(errorMsg);
      }
    }

  } catch (error) {
    const errorMsg = `Error al procesar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    console.error(`❌ ${errorMsg}`);
    result.errores.push(errorMsg);
  }

  return result;
}

async function main() {
  try {
    console.log('🚀 Iniciando importación de modelos...\n');

    // Verificar argumentos de línea de comandos
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('📋 Uso: npm run ts-node scripts/import-models.ts <ruta-del-archivo>');
      console.log('📋 Ejemplo: npm run ts-node scripts/import-models.ts ./Infinix.txt');
      process.exit(1);
    }

    const filePath = args[0];
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ El archivo no existe: ${filePath}`);
      process.exit(1);
    }

    // Importar modelos
    const result = await importModelsFromFile(filePath);

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
    console.log('='.repeat(50));
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📱 Total de modelos en archivo: ${result.totalModelos}`);
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} modelos nuevos.`);
    } else {
      console.log('\n⚠️  No se crearon nuevos modelos (posiblemente todos eran duplicados).');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
main();
