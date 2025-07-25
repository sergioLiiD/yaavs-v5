import { prisma } from '../src/lib/prisma';

async function checkAndCreateChecklistItems() {
  try {
    console.log('🔍 Verificando items de checklist...');
    
    // Verificar si existen items de checklist
    const existingItems = await prisma.checklist_items.findMany();
    console.log(`📊 Items existentes: ${existingItems.length}`);
    
    if (existingItems.length === 0) {
      console.log('⚠️ No hay items de checklist. Creando items por defecto...');
      
      const defaultItems = [
        {
          nombre: 'Pantalla intacta',
          descripcion: 'La pantalla no presenta fisuras ni daños visibles',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Cámara funcional',
          descripcion: 'La cámara frontal y trasera funcionan correctamente',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Batería original',
          descripcion: 'La batería es la original del dispositivo',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Carcasa en buen estado',
          descripcion: 'La carcasa no presenta daños significativos',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Botones funcionales',
          descripcion: 'Todos los botones físicos funcionan correctamente',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Altavoces funcionando',
          descripcion: 'Los altavoces reproducen audio correctamente',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Micrófono funcional',
          descripcion: 'El micrófono captura audio correctamente',
          para_diagnostico: true,
          para_reparacion: false
        },
        {
          nombre: 'Sensores funcionando',
          descripcion: 'Los sensores (proximidad, luz, etc.) funcionan correctamente',
          para_diagnostico: true,
          para_reparacion: false
        }
      ];
      
      for (const item of defaultItems) {
        await prisma.checklist_items.create({
          data: {
            ...item,
            updated_at: new Date()
          }
        });
      }
      
      console.log('✅ Items de checklist creados exitosamente');
    } else {
      console.log('✅ Ya existen items de checklist');
      existingItems.forEach(item => {
        console.log(`  - ${item.nombre} (ID: ${item.id}, Diagnóstico: ${item.para_diagnostico}, Reparación: ${item.para_reparacion})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateChecklistItems(); 