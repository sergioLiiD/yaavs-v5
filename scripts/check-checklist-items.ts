import { prisma } from '../src/lib/prisma';

async function checkAndCreateChecklistItems() {
  try {
    console.log('🔍 Verificando items de checklist...');
    
    // Verificar si existen items de checklist
    const existingItems = await prisma.checklist_items.findMany();
    console.log(`📋 Items existentes: ${existingItems.length}`);
    
    if (existingItems.length === 0) {
      console.log('⚠️ No hay items de checklist. Creando items por defecto...');
      
      const defaultItems = [
        {
          nombre: 'Verificar encendido del dispositivo',
          descripcion: 'Confirmar que el dispositivo enciende correctamente',
          para_diagnostico: true,
          para_reparacion: true
        },
        {
          nombre: 'Revisar pantalla y display',
          descripcion: 'Verificar que la pantalla funcione sin problemas',
          para_diagnostico: true,
          para_reparacion: true
        },
        {
          nombre: 'Probar conectividad (WiFi, Bluetooth)',
          descripcion: 'Verificar que las conexiones inalámbricas funcionen',
          para_diagnostico: true,
          para_reparacion: true
        },
        {
          nombre: 'Revisar puertos y conectores',
          descripcion: 'Verificar que todos los puertos estén en buen estado',
          para_diagnostico: true,
          para_reparacion: true
        },
        {
          nombre: 'Probar cámara y micrófono',
          descripcion: 'Verificar funcionamiento de cámara y micrófono',
          para_diagnostico: true,
          para_reparacion: true
        },
        {
          nombre: 'Verificar batería y carga',
          descripcion: 'Probar que la batería cargue correctamente',
          para_diagnostico: true,
          para_reparacion: true
        },
        {
          nombre: 'Limpiar dispositivo',
          descripcion: 'Limpiar exterior e interior del dispositivo',
          para_diagnostico: false,
          para_reparacion: true
        },
        {
          nombre: 'Actualizar software/firmware',
          descripcion: 'Instalar actualizaciones disponibles',
          para_diagnostico: false,
          para_reparacion: true
        },
        {
          nombre: 'Realizar pruebas de rendimiento',
          descripcion: 'Ejecutar pruebas para verificar rendimiento',
          para_diagnostico: false,
          para_reparacion: true
        },
        {
          nombre: 'Verificar funcionamiento general',
          descripcion: 'Prueba final de todas las funciones',
          para_diagnostico: false,
          para_reparacion: true
        }
      ];
      
      for (const item of defaultItems) {
        await prisma.checklist_items.create({
          data: {
            ...item,
            updated_at: new Date()
          }
        });
        console.log(`✅ Creado: ${item.nombre}`);
      }
      
      console.log('🎉 Items de checklist creados exitosamente');
    } else {
      console.log('📋 Items existentes:');
      existingItems.forEach(item => {
        console.log(`  - ${item.nombre} (Diagnóstico: ${item.para_diagnostico}, Reparación: ${item.para_reparacion})`);
      });
    }
    
    // Verificar items específicos para reparación
    const itemsReparacion = await prisma.checklist_items.findMany({
      where: { para_reparacion: true }
    });
    
    console.log(`🔧 Items para reparación: ${itemsReparacion.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateChecklistItems(); 