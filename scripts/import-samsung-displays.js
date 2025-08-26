const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Samsung (formato del archivo .txt)
const SAMSUNG_DISPLAYS = [
  'T1166+F        A06/A065        ORIG C/M(BOUTIQUE)        NEGRO',
  'T1166        A06/A065        ORIG S/M        NEGRO',
  'T0555+F        A55        OLED C/M(BOUTIQUE)        NEGRO',
  'T0035+F        A35        OLED C/M(BOUTIQUE)        NEGRO',
  'T0055        A30        OLED S/M（BOUTIQUE)        NEGRO',
  'KL-HD064-A15        A15 4G(5G)        INCELL300+S/M        NEGRO',
  'KL-HD064-A24        A24/A24 4G/A25 5G/M34 5G        INCELL300+S/M        NEGRO',
  'T3377+F        A037U        ORIG C/M        NEGRO',
  'T4444+F        A02        ORIG C/M        NEGRO',
  'T1012+F        A03S        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0424        A32 4G        INCELL S/M        NEGRO',
  'KL-HD064-A11+F        A11 INCELL300+ C/M        NEGRO',
  'KL-HD062-A30S+F        A30S        INCELL300+ C/M        NEGRO',
  'KL-HD062-A10+F        A10/M10        INCELL300+ C/M        NEGRO',
  'KL-HD065-A03+F        A03        INCELL300+ C/M        NEGRO',
  'KL-HD065-A02S+F        A02S        INCELL300+ C/M        NEGRO',
  'KL-HD064-A11        A11/M11/A115        INCELL 300+ S/M        NEGRO',
  'KL-HD062-A30        A30/A50/A50S        INCELL300+ S/M        NEGRO',
  'T0424+F        A32 4G        INCELL C/M        NEGRO',
  'KL-HD065-M12+F        A12        INCELL300+ C/M(BOUTIQUE)        NEGRO',
  'KL-HD066-A21        A21S        INCELL300+ C/M        NEGRO',
  'KL-HD066-A72        A72/A725        INCELL300+ S/M        NEGRO',
  'KL-HD066-A71        A71/A715        INCELL300+ S/M        NEGRO',
  'KL-HD062-A30S        A30S        INCELL300+ S/M        NEGRO',
  'KL-HD062-A10        A10/M10        INCELL300+ S/M        NEGRO',
  'T2255+F        A25        OLED C/M(BOUTIQUE)        NEGRO',
  'T1155+F        A15 4G/5G        OLED C/M(BOUTIQUE)        NEGRO',
  'T2222+F        A02S        ORIG C/M(BOUTIQUE)        NEGRO',
  'T3333+F        A03        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0185+F        A30/A50/A50S        INCELL C/M        NEGRO',
  'T0344+F        A51/A515        INCELL C/M        NEGRO',
  'T0055+F        A30        OLED C/M（BOUTIQUE)        NEGRO',
  'T0335+F/        A53/A536        OLED C/M        NEGRO',
  'T0901+F/        A52/A52S/A525 4G/A525 5G        OLED C/M        NEGRO',
  'T0147+F        A70/A70S        INCELL C/M        NEGRO',
  'T1440        A14 4G/A145P        ORIG S/M        NEGRO',
  'T1212+F        A12        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0550        A05        ORIG S/M        NEGRO',
  'T0606        A05S        ORIG S/M        NEGRO',
  'T0015+F        A20S/A207        ORIG C/M(BOUTIGQUE)        NEGRO',
  'T9181+F        A24        OLED C/M(BOUTIQUE)        NEGRO',
  'T0048        A730/A8PLUS        OLED S/M        NEGRO',
  'T1350        A04CORE/A04S/A13 5G/A136B        ORIG S/M        NEGRO',
  'T0190        A10E        ORIG S/M        NEGRO',
  'T7360+F        A73 5G        ORIG C/M (BOUTIQUE)        NEGRO',
  'T0977+F        A30S        OLED C/M(BOUTIQUE)        NEGRO',
  'T0023+F        A20        OLED C/M(BOUTIQUE)        NEGRO',
  'T0066+F        A50/A50S        OLED C/M（BOUTIQUE)        NEGRO',
  'T0211+F        A21S        ORIG C/M        NEGRO',
  'T0069        A10/M10        ORIG S/M        NEGRO',
  'T0069+F        A10/M10        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0756+F        A31/A315        OLED C/M(BOUTIQUE)        NEGRO',
  'T1022+F        A22 4G        OLED C/M (BOUTIQUE)        NEGRO',
  'T4607+F        A54        OLED C/M(BOUTIQUE)        NEGRO',
  'T0102        A30S        INCELL S/M        NEGRO',
  'T9090+F        A34 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0115+F        A22 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'T1460+F        A14 5G/A146B        ORIG C/M (BOUTIQUE)        NEGRO',
  'T0334+F        A71/A715        OLED C/M (BOUTIQUE)        NEGRO',
  'T6660+F        A03 CORE        ORIG C/M (BOUTIQUE)        NEGRO',
  'T0006+F        A13 4G        ORIG C/M(BOUTIQUE）        NEGRO',
  'T5555+F        A04        ORIG C/M (BOUTIQUE）        NEGRO',
  'T3014+F        A04E        ORIG C/M（BOUTIQUE)        NEGRO',
  'T1305+F        A23 4G        ORIG C/M（BOUTIQUE )        NEGRO',
  'T0725+F        A72/A725        OLED C/M (BOUTIQUE)        NEGRO',
  'T0335+F        A53/A536        OLED ORIG C/M(BOUTIQUE)        NEGRO',
  'T7799+F        A33        OLED C/M (BOUTIQUE)        NEGRO',
  'T1460        A14 5G/A146B        ORIG S/M        NEGRO',
  'T0006        "A13/A13 4G/A13 LITE/ A23 4G/ A23 LITE /M23/M23 5G/M336B/M33 5G"        ORIG S/M UNIVERSAL        NEGRO',
  'T3014        A04E        ORIG S/M        NEGRO',
  'T5555        A04/A045        ORIG S/M        NEGRO',
  'T6660        A03 CORE        ORIG S/M        NEGRO',
  'T0002+F        A22 4G        INCELL C/M        NEGRO',
  'T0333+F        A51/A515        OLED ORIG C/M(BOUTIQUE)        NEGRO',
  'T0987        A70/A70S        INCELL C/M（BOUTIQUE)        NEGRO',
  'T0987+F        A70/A70S        OLED C/M（BOUTIQUE)        NEGRO',
  'T0901+F        A52/A52S/A525        OLED C/M（BOUTIQUE)        NEGRO',
  'T1032+F        A32 4G        OLED C/M(BOUTIQUE)        NEGRO',
  'T0005+F        A31/A315        INCELL C/M        NEGRO',
  'T0234+F        A20        INCELL C/M        NEGRO',
  'T0115        A22 5G        ORIG S/M        NEGRO',
  'T0015        A20S/A207        ORIG S/M        NEGRO',
  'T0180        A10S/A107        ORIG S/M        NEGRO',
  'T0052        A01M        ORIG S/M        NEGRO',
  'T2222        A02S/A03/A03S/A04E        ORIG S/M        NEGRO',
  'T0211        A21S/A217        ORIG S/M        NEGRO',
  'T4111        A11/M11/A115        ORIG S/M        NEGRO',
  'T1212        A02/A12/A32 5G/M02/M127/F12        ORIG S/M(UNIVERSAL)        NEGRO',
  'KL-HD057-SJ6        J6        INCELL300+S/M        NEGRO',
  'KL-HD055-J7PA/N        J7 PRIME        INCELL300+ S/M        NEGRO',
  'KL-HD055-J7PA/B        J7 PRIME        INCELL300+ S/M        BLANCO',
  'KL-HD050-J5P-B        J5 PRIME        INCELL300+ S/M        BLANCO',
  'KL-HD050-J5P-N        J5 PRIME        INCELL300+ S/M        NEGRO',
  'KL-HD060-J8        J8        INCELL300+ S/M        NEGRO',
  'T0790-N        J7 PRIME        INCELL S/M        NEGRO',
  'T0790-B        J7 PRIME        INCELL S/M        BLANCO',
  'T0028        J8        INCELL S/M        NEGRO',
  'T0209-O        J730/J7PRO        INCELL S/M        ORO',
  'T0209-N        J730/J7PRO        INCELL S/M        NEGRO',
  'T0089        J530/J5PRO        OLED S/M        NEGRO',
  'T0907        J8        OLED S/M        NEGRO',
  'T0092        J6        OLED S/M        NEGRO',
  'T0043        J5        OLED S/M        NEGRO',
  'T0540-B        J5 PRIME        ORIG S/M        BLANCO',
  'T0540-N        J5 PRIME        ORIG S/M        NEGRO',
  'T0819        J4CORE/J4PLUS/J6PLUS/J610        ORIG C/PEGAMENTO        NEGRO',
  'T0262        J4        INCELL S/M        NEGRO',
  'T7373-O        J730/J7PRO        INCELL S/M        ORO',
  'T0019-O        J730/J7PRO        OLED S/M        ORO',
  'T7001-O        J701/J7 NEO        INCELL S/M        ORO',
  'T0101-O        J701/J7 NEO        OLED S/M        ORO',
  'T0001-O        J7        INCELL S/M        ORO',
  'T0380-O        J7        OLED S/M        ORO',
  'T7373-N        J730/J7PRO        INCELL S/M        NEGRO',
  'T0019-N        J730/J7PRO        OLED S/M        NEGRO',
  'T7001-N        J701/J7 NEO        INCELL S/M        NEGRO',
  'T0101-N        J701/J7 NEO        OLED S/M        NEGRO',
  'T0001-N        J7        INCELL S/M        NEGRO',
  'T0380-N        J7        OLED S/M        NEGRO',
  'KL-HD062-M2        M20        INCELL300+ S/M        NEGRO',
  'KL-HD062-M30+F        M30 INCELL300+ C/M        INCELL301+ C/M        NEGRO',
  'KL-HD062-M30        M21/M30/M30S/ M31        INCELL300+ S/M        NEGRO',
  'T1199+F        M14 5G/M146B        ORIG C/M(BOUTIQUE)        NEGRO',
  'T1199        M14 5G/M146B        ORIG S/M        NEGRO',
  'T5699+F        M53 5G        OLED C/M(BOUTIQUE)        NEGRO',
  'T0988        M30        OLED S/M        NEGRO',
  'T0926        M21/M30/M30S/M31        INCELL S/M        NEGRO',
  'T0008+F        M23 4G/M33        ORIG C/M(BOUTIQUE)        NEGRO',
  'SA056 WF        HG NOTE10 PLUS        "SOFT OLED C/M(ORIGBOUTIQUE)CURVO"        NEGRO',
  'SA130 WF        HG NOTE20 ULTRA        "SOFT OLED C/M(ORIGBOUTIQUE)CURVO"        NEGRO',
  'T2344+F        NOTE20 ULTRA        ORIG C/M(BOUTIQUE)        NEGRO',
  'T3230+F        NOTE10 PLUS        SOFT OLED  C/M(BOUTIQUE)        NEGRO',
  'T2750+F        SAMSUNG-NOTE20        OLED C/M(BOUTIQUE)        NEGRO',
  'T9898+F        NOTE10 LITE        AMOLED C/M (BOUTIQUE)        NEGRO',
  'TG035        G530 LCD INCELL S/M        NEGRO',
  'SA128 WF        HG S22 ULTRA        "SOFT OLED C/M(ORIGBOUTIQUE)CURVO"        NEGRO',
  'E013 WF        HG S20 ULTRA        "SOFT OLED C/M(ORIGBOUTIQUE)CURVO"        NEGRO',
  'E011+ WF        HG S20 PLUS        "SOFT OLED C/M(ORIG BOUTIQUE)"        NEGRO',
  'SA129 WF        HG S23 ULTRA        "SOFT OLED C/M(ORIGBOUTIQUE)CURVO"        NEGRO',
  'E014+ WF        HG S21 PLUS        "SOFT OLED C/M(ORIG BOUTIQUE)"        NEGRO',
  'E015 WF        HG S21 ULTRA        "SOFT OLED C/M(ORIGBOUTIQUE)CURVO"        NEGRO',
  'SA131 WF        HG S22 PLUS        "SOFT OLED C/M(ORIG BOUTIQUE)"        NEGRO',
  'T2244+F        S24 ULTRA        AMOLED C/M(BOUTIGUE)        NEGRO',
  'T2323/S        S23        ORIG C/M(BOUTIQUE)        PLATEADO',
  'T2323        S23        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0022/S        S22        ORIG C/M(BOUTIQUE)        PLATEADO',
  'T1100        S10        ORIG C/M(BOUTIQUE)        NEGRO',
  'T1010        S10 PLUS        AMOLED C/M(BOUTIQUE)        NEGRO',
  'T2233+F        S23 ULTRA        SOFT OLED C/M(BOUTIGUE)        NEGRO',
  'T4595+F        S21 PLUS        SOFT OLED ORIG C/M        NEGRO',
  'T6600+F        S22 ULTRA SOFT OLED C/M(BOUTIQUE)        NEGRO',
  'T0022        S22        ORIG C/M(BOUTIQUE)        NEGRO',
  'T0828+F        S22 PLUS        ORIG C/M        NEGRO',
  'T9999        S9 PLUS        AMOLED C/M（BOUTIQUE）        NEGRO',
  'T2220+F        S20 PLUS        SOFT OLED C/M(BOUTIQUE)        NEGRO',
  'T8888+F        S8PLUS        AMOLED C/M（BOUTIQUE)        NEGRO',
  'T0999+F        S9        AMOLED C/M（BOUTIQUE）        NEGRO',
  'T7686+F        S21 ULTRA        "SOFT OLED C/M(BOUTIQUE)CURVO"        NEGRO',
  'T2211+F        S20 ULTRA        "SOFT OLED C/M(BOUTIQUE)CURVO"        NEGRO',
  'T0888        S8        "AMOLED C/M(BOUTIQUE)CURVO"        NEGRO',
  'T2110+F        S20 FE        OLED C/M(BOUTIQUE)        NEGRO'
];

async function importSamsungDisplays() {
  const result = {
    marca: 'Samsung',
    totalProductos: SAMSUNG_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Samsung...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

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

    // Procesar cada producto
    for (const productoLinea of SAMSUNG_DISPLAYS) {
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
        const nombre = `Display Samsung ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Samsung.`);
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
importSamsungDisplays();
