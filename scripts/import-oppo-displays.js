const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Oppo (formato del archivo .txt)
const OPPO_DISPLAYS = [
  'KL-HD065-A16        A16/A16S/A54S/Realme C25/RealmeC25S/NARZO50A        INCELL300+S/M        NEGRO',
  'KL-HD064-R7        "RENO7 4G(5G)/A78 4G/RENO7SE 5G/RENO8 4G(5G)/RENO8T/F21PRO 4G/F21S PRO 4G/1+NORD CE2/FIND X5 LI"        INCELL301+S/M        NEGRO',
  'KL-HD062-A12        A12/A7/AX7/A5S/A12S/A7n/Ax5s/realme3/realme3i        INCELL300+ S/M        NEGRO',
  'KL-HD065-A57        "A17/A17K//A38/A57/A57S/A57E/A58 5G/A58X 5G/ A77/A78 5G/K10 5G/N20SE"        INCELL S/M        NEGRO',
  'KL-HD065-A92        A52/A72/A92        INCELL300+ S/M        NEGRO',
  'KL-HD065-C21        C21Y/C25Y        INCELL S/M        NEGRO',
  'KL-HD067-C53        C53/Narzo N53/C51/C36/C60/NOTE50        INCELL S/M        NEGRO',
  'KL-HD065-P32        A53 4G/1+N100/A32/A33/A53S/A11S/ REALME7I/REALME C17        ORIG S/M(UNIVERSAL)        NEGRO',
  'KL-HD065-A11        "A5 2020//A8/A11/A11X/A31/A9 2020 /realme5/realme5i/realme5s/ A31/2020/realmeC3/C3i"        INCELL S/M        NEGRO',
  'P0934        A93 4G        INCELL S/M        NEGRO',
  'P0015+F        A15/A15S/A16K        ORIG C/M(BOUTIQUE)        NEGRO',
  'C0011+F        C11 2021/C20/C21        ORIG C/M(BOUTIQUE)        NEGRO',
  'P0157+F        A17/A17K        ORIG C/M(BOUTIQUE)        NEGRO',
  'C3003+F        C30S        ORIG C/M_NEGRO        NEGRO',
  'P0092+F        A52/A72/A92 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'P0935+F        A93 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'C0303+F        c30/C33        ORIG C/M(BOUTIQUE)        NEGRO',
  'P0053+F        A32/A33/A53 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'P0016+F        A16        ORIG C/M(BOUTIQUE)        NEGRO',
  'P0054+F        A54 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'P0584+F        A58 4G        ORIG C/M        NEGRO',
  'C0035+F        C35        ORIG C/M(BOUTIQUE)        NEGRO',
  'C0021+F        C21Y        ORIG C/M(BOUTIQUE)        NEGRO',
  'C0750        "REALME7 5G/A72 5G/A73 5G/A53/5G/K7X/REALME Q2/REALME V5/NARZO30 PRO"        ORIG S/M        NEGRO',
  'C0008        8I/9i        ORIG S/M        NEGRO',
  'C0053        C51/C51S/C53/Narzo N53/C36/C60/Note50        ORIG S/M        NEGRO',
  'C3003        C30S        ORIG S/M        NEGRO',
  'P1212        A12/A7/A7n/A5S/Ax5S/A11K/A12s/Realme3/Realme3i        ORIG S/M        NEGRO',
  'C3300/C0303        c30/C30i/C33/C50i        ORIG S/M        NEGRO',
  'C0021        C21Y/C25Y        ORIG S/M        NEGRO',
  'C0035        C35/narzo50A/prime C3/prime C5        ORIG S/M        NEGRO',
  'C0011        C11 2021/C20/C21        ORIG S/M        NEGRO',
  'C0055/P0584        "A1 5G/A2 5G/REALME C55/C67/N55/K11X 5G/REALME11 5G/11X 5G/F23/A58 4G/A79 5G/V50/V50S A98 4G"        ORIG S/M        NEGRO',
  'C0003        "A5 2020/A8/A11/A11X/A9 2020/realme5/realme5i/realme5s/A31 2020/realmeC3/realme6i /Narzo10A/Nar"        ORIG S/M        NEGRO',
  'P0935        A93 5G        ORIG S/M        NEGRO',
  'P0092        A52 4G/A72 4G/A92 4G        ORIG S/M(UNIVERSAL)        NEGRO',
  'C0077        "REALME6/REALME7/REALME6S/REALME6I IZQUIERDO/NARZO20 PRO/NARZO30 4G"        ORIG S/M        NEGRO',
  'P0157        "A17/A17K//A38/A57/A57S/A57E/A58 5G/A58X 5G/ A77/A78 5G/K10 5G/N20SE"        ORIG S/M        NEGRO',
  'P0054        A54 4G/A55 4G/A94 4G        ORIG S/M        NEGRO',
  'P0053        A53 4G/1+N100/A32/A33/A53S/A11S/ REALME7I/REALME C17        ORIG S/M(UNIVERSAL)        NEGRO',
  'P0016        A16/A16S/A54S/A56/4G/C25/C25S/NARZO50A        ORIG S/M        NEGRO',
  'P0015        "A15/A15S/A16K/A16E/A35/REALME C11 2020/REALME C12/REALME C15CONFIGRACION BAJA)"        ORIG S/M        NEGRO',
  'P0076        RENO7 4G(5G)/RENO7SE/RENO8 4G(5G)/RENO8T/1+NORD CE2        INCELL S/M        NEGRO',
  'P0055        "RENO5 LITE /RENO6 LITE/RENO7 LITE/ Reno4se /Reno5Z /Reno5F /Reno6Z"        INCELL S/M        NEGRO',
  'P0074+F        Reno7 4G        OLED C/M (BOUTIQUE)        NEGRO',
  'P0066+F        Reno6 LITE        OLED C/M(BOUTIQUE)        NEGRO',
  'P0095+F        Reno5 LITE        OLED C/M(BOUTIQUE)        NEGRO',
  'P0074        "RENO7 4G(5G)/RENO7SE 5G/RENO8 4G(5G)/RENO8T/A78 4G/F21S PRO4G/FIND X5 LITE 5G/"        OLED S/M        NEGRO',
  'P0066        "RENO6 LITE/RENO7 LITE 5G/RENO8 LITE/RENO7Z/ F19 4G/F19S 4G/F21PRO 5G/A74 4G/A95 4G/"        OLED S/M        NEGRO',
  'P0095        RENO5 LITE/RENO 4SE/RENO 5Z/RENO 5F/RENO 6Z        OLED S/M        NEGRO',
  'P0075        "RENO5 4G(5G)/ RENO5K/RENO6 4G(5G)/RENO7 5G/FIND X3 LITE/K9 5G/K9PRO 5G"        OLED S/M        NEGRO',
  'P0115        RENO11 5G        AMOLED ORIG S/M        NEGRO',
  'P0010        RENO9/RENO10 5G/RENO8T 5G/A1 PRO        ORIG S/M        NEGRO',
  'C0088        REALME7 PRO 04        ORIG S/M        NEGRO'
];

async function importOppoDisplays() {
  const result = {
    marca: 'Oppo',
    totalProductos: OPPO_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Oppo...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

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

    // Procesar cada producto
    for (const productoLinea of OPPO_DISPLAYS) {
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
        const nombre = `Display Oppo ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Oppo.`);
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
importOppoDisplays();
