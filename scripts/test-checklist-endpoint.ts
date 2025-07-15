import { prisma } from '../src/lib/prisma';
import { ChecklistService } from '../src/services/checklistService';

async function testChecklistEndpoint() {
  try {
    console.log('🧪 Probando endpoint de checklist...');
    
    // 1. Probar directamente con Prisma
    console.log('\n1️⃣ Probando consulta directa con Prisma:');
    const itemsDirect = await prisma.checklist_items.findMany();
    console.log(`Items encontrados: ${itemsDirect.length}`);
    itemsDirect.forEach(item => {
      console.log(`  - ${item.nombre} (Reparación: ${item.para_reparacion})`);
    });
    
    // 2. Probar con el servicio
    console.log('\n2️⃣ Probando con ChecklistService:');
    const itemsService = await ChecklistService.getAll();
    console.log(`Items del servicio: ${itemsService.length}`);
    itemsService.forEach(item => {
      console.log(`  - ${item.nombre} (Reparación: ${item.para_reparacion})`);
    });
    
    // 3. Probar filtro para reparación
    console.log('\n3️⃣ Probando filtro para reparación:');
    const itemsReparacion = await prisma.checklist_items.findMany({
      where: { para_reparacion: true }
    });
    console.log(`Items para reparación: ${itemsReparacion.length}`);
    itemsReparacion.forEach(item => {
      console.log(`  - ${item.nombre}`);
    });
    
    // 4. Simular lo que hace el componente
    console.log('\n4️⃣ Simulando filtro del componente:');
    const itemsParaReparacion = itemsService.filter((item: any) => item.paraReparacion);
    console.log(`Items filtrados para reparación: ${itemsParaReparacion.length}`);
    itemsParaReparacion.forEach(item => {
      console.log(`  - ${item.nombre}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testChecklistEndpoint(); 