const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de baterías Apple desde el archivo
const bateriasApple = [
  { sku: 'BT-IP-12MINI', nombre: '12MINI' },
  { sku: 'BT-IP-13', nombre: '13' },
  { sku: 'BT-IP-13MINI', nombre: '13MINI' },
  { sku: 'BT-IP-12 MINI', nombre: '12 MINI' },
  { sku: 'BT-IP-12PRO MAX', nombre: '12PRO MAX' },
  { sku: 'BT-IP-12/12PRO', nombre: '12/12PRO' },
  { sku: 'BT-IP-11PRO MAX', nombre: '11PRO MAX' },
  { sku: 'BT-IP-11PRO', nombre: '11PRO' },
  { sku: 'BT-IP-11', nombre: '11' },
  { sku: 'BT-IP-XS MAX', nombre: 'XS MAX' },
  { sku: 'BT-IP-XR', nombre: 'XR' },
  { sku: 'BT-IP-XS', nombre: 'XS' },
  { sku: 'BT-IP-X', nombre: 'X' },
  { sku: 'BT-IP-8PLUS', nombre: '8PLUS' },
  { sku: 'BT-IP-SE 2020', nombre: 'SE 2020' },
  { sku: 'BT-IP-8G', nombre: '8G' },
  { sku: 'BT-IP-7PLUS', nombre: '7PLUS' },
  { sku: 'BT-IP-7G', nombre: '7G' },
  { sku: 'BT-IP-6S PLUS', nombre: '6S PLUS' },
  { sku: 'BT-IP-6G', nombre: '6G' }
];

// Función para subir baterías Apple
async function uploadBateriasApple() {
  try {
    console.log('🚀 Iniciando carga de baterías Apple...\n');

    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const bateria of bateriasApple) {
      try {
        // Verificar si el producto ya existe
        const productoExistente = await prisma.productos.findFirst({
          where: { sku: bateria.sku }
        });

        if (productoExistente) {
          // Actualizar producto existente
          await prisma.productos.update({
            where: { id: productoExistente.id },
            data: {
              nombre: `Batería Apple iPhone ${bateria.nombre}`,
              categoria: 'BATERIAS',
              marca: 'APPLE',
              updated_at: new Date()
            }
          });
          actualizados++;
          console.log(`🔄 Actualizado: ${bateria.sku} - ${bateria.nombre}`);
        } else {
          // Crear nuevo producto
          await prisma.productos.create({
            data: {
              sku: bateria.sku,
              nombre: `Batería Apple iPhone ${bateria.nombre}`,
              categoria: 'BATERIAS',
              marca: 'APPLE',
              precio_promedio: 0,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          creados++;
          console.log(`✅ Creado: ${bateria.sku} - ${bateria.nombre}`);
        }

      } catch (error) {
        console.error(`❌ Error con ${bateria.sku}: ${error.message}`);
        errores++;
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(50));
    console.log(`📦 Total baterías en archivo: ${bateriasApple.length}`);
    console.log(`✅ Productos creados: ${creados}`);
    console.log(`🔄 Productos actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);

    if (creados > 0 || actualizados > 0) {
      console.log(`\n🎉 ¡Carga completada! Baterías Apple disponibles en el sistema`);
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
uploadBateriasApple();
