const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Xiaomi (formato del archivo .txt)
const XIAOMI_DISPLAYS = [
  'KL-HD065-A1+        REDMI A1+/A1/A2/A2+/POCC C50        INCELL300+  S/M        NEGRO',
  'Z6988+F        REDMI A1/A1 PLUS/A2/A2PLUS/POCO C50        ORIG C/M(BOUTIQUE)        NEGRO',
  'Z6988        REDMI A1/A1 PLUS/A2/ A2PLUS/POCO C50        ORIG S/M        NEGRO',
  'Z0202        MI A2/6X        ORIG S/M        NEGRO',
  'Z0003+F        REDMI A3        ORIG C/M(BOUTIUQE)        NEGRO',
  'Z0003        REDMI A3        ORIG S/M        NEGRO',
  'Z0011        MI A1/5X        INCELL S/M        NEGRO',
  'Z0949        MI A3        INCELL S/M        NEGRO',
  'Z0634        MI A3/CC9E        OLED S/M        NEGRO',
  'Z0014+F        REDMI 14C        ORIG C/M(BOUTIGUE)        NEGRO',
  'Z0014        REDMI 14C        ORIG S/M        NEGRO',
  'KL-HD067-13C        REDMI 13C/POCO C65        INCELL300+ S/M        NEGRO',
  'KL-HD065-9B        REDMI 9/9 PRIME        INCELL300+ S/M        NEGRO',
  'Z3232        REDMI 12        ORIG S/M        NEGRO',
  'Z1202+F        REDMI 12C        ORIG C/M(BOOUTIQUE)        NEGRO',
  'Z3311        REDMI 13C/POCO C65        ORIG S/M        NEGRO',
  'Z1202        REDMI 12C        ORIG S/M        NEGRO',
  'Z0303        MI11T/MI11T PRO        AMOLED S/M        NEGRO',
  'Z2520        MI 10        AMOLED S/M(CURVO)        NEGRO',
  'Z0404        REDMI 8/8A        ORIG S/M        NEGRO',
  'Z0717+F        REDMI 9        ORIG C/M(BOUTIQUE)        NEGRO',
  'Z1012        MI10 LITE        OLED S/M        NEGRO',
  'Z012T        MI13T/13T PRO        ORIG S/M        NEGRO',
  'Z0789        MI10T/MI10T PRO/K30S        ORIG S/M        NEGRO',
  'Z0670        MI9        OLED S/M        NEGRO',
  'Z0234        MI11 LITE 4G/5G        OLED S/M        NEGRO',
  'Z0640        MI 9T/9T PRO/K20        OLED S/M        NEGRO',
  'Z0999+F        REDMI 9A/9AT/9C/10A        ORIG C/M（BOUTIQUE）        NEGRO',
  'Z0444        REDMI 10C/10 POWER/POCO C40/10 INDIA        ORIG S/M        NEGRO',
  'Z0999        REDMI 9A/9AT/9i/9C/10A/POCO C3/POCO C31        ORIG S/M(UNIVERSAL)        NEGRO',
  'Z0717        REDMI 9/9 PRIME        ORIG S/M        NEGRO',
  'Z0667        REDMI POCO X6PRO        INCELL S/M        NEGRO',
  'Z0128        REDMI POCO X6PRO        OLED S/M        NEGRO',
  'Z0675+F        POCO M4/M5        ORIG C/M(BOUTIQUE)        NEGRO',
  'Z0666        POCO F3/POCO F4/MI11 i/MI11 X        OLED S/M        NEGRO',
  'Z0551        POCO F3/POCO F4/MI11 i/MI11 X        INCELL S/M        NEGRO',
  'Z0334        REDMI NOTE 13 PRO 4G/M6 PRO        OLED S/M        NEGRO',
  'Z0021        REDMI NOTE12 4G&5G /POCO X5        INCELL S/M        NEGRO',
  'KL-HD064-N8P        REDMI NOTE8 PRO        INCELL300+S/M        NEGRO',
  'KL-HD064-N11        REDMI Note11 4G/Note11S/NOTE12S/POCO M4PRO 4G        INCELL300+ S/M        NEGRO',
  'Z3456        REDMI NOTE13 5G        ORIG S/M+        NEGRO',
  'KL-HD065-N9        REDMI 9T/NOTE9 4G/POCO M3/MI9 POWER        INCELL S/M        NEGRO',
  'Z0417+F        REDMI NOTE11S        OLED C/M9BOUTIQUE)        NEGRO',
  'Z1133+F/O        NOTE 13 4G        OLED C/M S/HUELLA        ORO',
  'Z1133+F/0        NOTE 13 4G        OLED C/M S/HUELLA        ORO',
  'Z1133+F/V        NOTE 13 4G        OLED C/M S/HUELLA        VERDE',
  'Z1133+F/A        NOTE 13 4G        OLED C/M S/HUELLA        AZUL',
  'Z1133+F        NOTE 13 4G        OLED C/M S/HUELLA        NEGRO',
  'Z0105        "REDMI NOTE10 5G/NOTE11 SE/NOTE10S 5G/NOTE10T/NOTE11 SE/POCO M3 PRO"        ORIG S/M        NEGRO',
  'Z1133        NOTE 13 4G        OLED S/M S/HUELLA        NEGRO',
  'Z0021+F        REDMI NOTE12 5G/ POCO X5        INCELL C/M(BOUTIQUE)        NEGRO',
  'Z0675        POCO M4/M5/REDMI10 5G/NOTE11 E/NOTE11 R/11PRIME        ORIG S/M        NEGRO',
  'Z7878        REDMI NOTE12 PRO 5G        OLED S/M        NEGRO',
  'Z1279        "REDMI NOTE10PRO/NOTE10PRO MAX/NOTE11PRO/NOTE11PRO LIUS/POCO X4PRO/NOTE12PRO 4G"        OLED S/M        NEGRO',
  'Z1313        REDMI NOTE12 PRO 5G        INCELL S/M        NEGRO',
  'Z0044        MI NOTE10/NOTE10LITE/NOTE10PRO/CC9PRO        AMOLED S/M        NEGRO',
  'Z0887+F        REDMI NOTE10PRO        INCELL C/M（BOUTIQUE)        NEGRO',
  'Z0022+F        REDMI NOTE9/NOTE10X        ORIG C/M(BOUTIQUE)        NEGRO',
  'Z0088        REDMI NOTE8PRO        COG S/M        NEGRO',
  'Z3690+F        REDMI NOTE12 5G/POCO X5        INCELL C/M(BOUTIQUE)        NEGRO',
  'Z0091+F        REDMI NOTE10 4G/10S/POCO M5S        INCELL C/M(BOUTIQUE)        NEGRO',
  'Z0535+F        REDMI NOTE10 4G/10S/POCO M5S        OLED C/M (BOUTIQUE)        NEGRO',
  'Z1120+F        REDMI 9T/NOTE9 4G/POCO M3        ORIG C/M(BOUTIQUE)        NEGRO',
  'Z1212+F        REDMI NOTE12 4G        INCELL C/M(BOUTIQUE)        NEGRO',
  'Z1212        REDMI NOTE12 4G/5G /POCO X5        INCELL S/M        NEGRO',
  'Z1120        REDMI 9T/NOTE9 4G/POCO M3/MI9 POWER        ORIG S/M        NEGRO',
  'Z0179+F        REDMI NOTE11 4G/NOTE11S/POCO M4PRO 4G        INCELL C/M(BOUTIQUE)        NEGRO',
  'Z0330        REDMI NOTE10PRO 5G/POCO X3 GT        ORIG S/M        NEGRO',
  'Z0345        POCO X3/X3 PRO/NOTE9PRO 5G/CMI 10T LITE        ORIG S/M        NEGRO',
  'Z1110        REDMI NOTE12 4G&5G/POCO X5        OLED S/M        NEGRO',
  'Z0690+F        REDMI NOTE8        INCELL C/M(BOUTIQUE)        NEGRO',
  'Z0690        REDMI NOTE8        INCELL S/M        NEGRO',
  'Z0092        REDMI NOTE7/NOTE7 PRO        INCELL S/M        NEGRO',
  'Z1122        REDMI NOTE11 4G/11S/12S/POCO M4PRO 4G        INCELL S/M        NEGRO',
  'Z8877        REDMI NOTE11 4G/NOTE11S/NOTE12S/POCO M4PRO 4G        OLED S/M        NEGRO',
  'Z0091        REDMI NOTE10 4G/10S/POCO M5S        INCELL S/M        NEGRO',
  'Z0535        REDMI NOTE10 4G/10S/POCO M5S        OLED S/M        NEGRO',
  'Z0022        REDMI NOTE9/NOTE10X        ORIG S/M        NEGR0',
  'Z7000        REDMI NOTE11T PRO/NOTE12T PRO/POCO X4 GT        ORIG S/M        NEGRO',
  'Z0155        REDMI NOTE11 5G/POCO M4PRO 5G        ORIG S/M        NEGRO',
  'Z0123-Z0887        "REDMI NOTE10 PRO/NOTE10 PRO MAX/NOTE11 PRO/NOTE11 PLUS/POCO X4 PRO"        INCELL S/M        NEGRO',
  'Z0120        REDMI NOTE9S/NOTE9 PRO        ORIG S/M        NEGRO',
  'Z0010        REDMI 10/NOTE11 4G        ORIG S/M        NEGRO'
];

async function importXiaomiDisplays() {
  const result = {
    marca: 'Xiaomi',
    totalProductos: XIAOMI_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Xiaomi...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

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

    // Procesar cada producto
    for (const productoLinea of XIAOMI_DISPLAYS) {
      try {
        // Separar SKU, modelo, calidad y color (separados por espacios/tabs)
        const partes = productoLinea.trim().split(/\s+/);
        const sku = partes[0];
        const modelo = partes[1];
        const calidad = partes[2];
        const color = partes[3];

        if (!sku || !modelo || !calidad || !color) {
          throw new Error(`Formato inválido en línea: ${productoLinea}`);
        }

        // Verificar si el producto ya existe
        const productoExistente = await prisma.productos.findFirst({
          where: {
            sku: {
              equals: sku,
              mode: 'insensitive'
            }
          }
        });

        if (productoExistente) {
          console.log(`⚠️  Producto duplicado: ${sku}`);
          result.duplicados++;
          continue;
        }

        // Generar nombre del producto con modelo, calidad y color
        const nombre = `Display Xiaomi ${modelo} ${calidad} ${color}`;

        // Generar descripción con el modelo
        const descripcion = `Display compatible con: ${modelo}`;

        // Crear el producto
        const nuevoProducto = await prisma.productos.create({
          data: {
            sku: sku,
            nombre: nombre,
            descripcion: descripcion,
            marca_id: marca.id,
            modelo_id: null, // Sin modelo específico
            precio_promedio: 0, // Se configurará después
            stock: 0,
            stock_minimo: 1,
            stock_maximo: 10,
            tipo: 'PRODUCTO',
            updated_at: new Date()
          }
        });

        console.log(`✅ Producto creado: ${sku} - ${nombre} (ID: ${nuevoProducto.id})`);
        console.log(`   📝 Descripción: ${descripcion}`);
        result.creados++;

      } catch (error) {
        const errorMsg = `Error al crear producto "${productoLinea}": ${error.message || 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        result.errores.push(errorMsg);
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
    console.log('='.repeat(50));
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Total de productos: ${result.totalProductos}`);
    console.log(`✅ Productos creados: ${result.creados}`);
    console.log(`⚠️  Productos duplicados: ${result.duplicados}`);
    console.log(`❌ Errores: ${result.errores.length}`);

    if (result.errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      result.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (result.creados > 0) {
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Xiaomi.`);
      console.log('📋 Próximo paso: Configurar precios de venta en /dashboard/costos/precios-venta');
    } else {
      console.log('\n⚠️  No se crearon nuevos productos (posiblemente todos eran duplicados).');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
importXiaomiDisplays();
