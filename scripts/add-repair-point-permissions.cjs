const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Agregando permisos de repair-point...');

    const nuevosPermisos = [
      { codigo: 'PUNTO_DIAGNOSTICO_CREATE', nombre: 'Crear Diagnóstico', descripcion: 'Permite crear diagnósticos en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_DIAGNOSTICO_EDIT', nombre: 'Editar Diagnóstico', descripcion: 'Permite editar diagnósticos en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_DIAGNOSTICO_VIEW', nombre: 'Ver Diagnóstico', descripcion: 'Permite ver diagnósticos en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_CHECKLIST_DIAGNOSTICO_CREATE', nombre: 'Crear Checklist de Diagnóstico', descripcion: 'Permite crear checklist de diagnóstico en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_CHECKLIST_DIAGNOSTICO_EDIT', nombre: 'Editar Checklist de Diagnóstico', descripcion: 'Permite editar checklist de diagnóstico en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_CHECKLIST_DIAGNOSTICO_VIEW', nombre: 'Ver Checklist de Diagnóstico', descripcion: 'Permite ver checklist de diagnóstico en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_CHECKLIST_REPARACION_CREATE', nombre: 'Crear Checklist de Reparación', descripcion: 'Permite crear checklist de reparación en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_CHECKLIST_REPARACION_EDIT', nombre: 'Editar Checklist de Reparación', descripcion: 'Permite editar checklist de reparación en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_CHECKLIST_REPARACION_VIEW', nombre: 'Ver Checklist de Reparación', descripcion: 'Permite ver checklist de reparación en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_REPARACION_CREATE', nombre: 'Crear Reparación', descripcion: 'Permite crear reparaciones en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_REPARACION_EDIT', nombre: 'Editar Reparación', descripcion: 'Permite editar reparaciones en el punto de reparación', categoria: 'Punto de Reparación' },
      { codigo: 'PUNTO_REPARACION_VIEW', nombre: 'Ver Reparación', descripcion: 'Permite ver reparaciones en el punto de reparación', categoria: 'Punto de Reparación' }
    ];

    for (const permiso of nuevosPermisos) {
      await prisma.permisos.upsert({
        where: { codigo: permiso.codigo },
        update: {},
        create: { ...permiso, updated_at: new Date() }
      });
      console.log(`✅ Permiso creado/actualizado: ${permiso.codigo}`);
    }

    const roles = await prisma.roles.findMany({
      where: { nombre: { in: ['ADMINISTRADOR_PUNTO', 'OPERADOR_PUNTO'] } }
    });

    for (const rol of roles) {
      const permisos = await prisma.permisos.findMany({
        where: { codigo: { in: nuevosPermisos.map(p => p.codigo) } }
      });

      for (const permiso of permisos) {
        await prisma.roles_permisos.upsert({
          where: { rol_id_permiso_id: { rol_id: rol.id, permiso_id: permiso.id } },
          update: {},
          create: { rol_id: rol.id, permiso_id: permiso.id, updated_at: new Date() }
        });
        console.log(`  ✅ Permiso ${permiso.codigo} agregado al rol ${rol.nombre}`);
      }
    }

    console.log('\n🎉 Permisos de repair-point agregados exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 