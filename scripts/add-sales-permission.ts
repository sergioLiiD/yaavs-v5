import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSalesPermission() {
  try {
    console.log('🔄 Agregando permiso SALES_VIEW...');

    // Crear el permiso SALES_VIEW
    const salesPermission = await prisma.permisos.upsert({
      where: { nombre: 'SALES_VIEW' },
      update: {},
      create: {
        nombre: 'SALES_VIEW',
        descripcion: 'Permite ver y gestionar ventas de productos',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Permiso SALES_VIEW creado:', salesPermission);

    // Buscar el rol de administrador
    const adminRole = await prisma.roles.findFirst({
      where: { nombre: 'ADMINISTRADOR' }
    });

    if (adminRole) {
      // Asignar el permiso al rol de administrador
      await prisma.roles_permisos.upsert({
        where: {
          rol_id_permiso_id: {
            rol_id: adminRole.id,
            permiso_id: salesPermission.id
          }
        },
        update: {},
        create: {
          rol_id: adminRole.id,
          permiso_id: salesPermission.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ Permiso SALES_VIEW asignado al rol ADMINISTRADOR');
    }

    // Buscar el rol de técnico
    const tecnicoRole = await prisma.roles.findFirst({
      where: { nombre: 'TECNICO' }
    });

    if (tecnicoRole) {
      // Asignar el permiso al rol de técnico
      await prisma.roles_permisos.upsert({
        where: {
          rol_id_permiso_id: {
            rol_id: tecnicoRole.id,
            permiso_id: salesPermission.id
          }
        },
        update: {},
        create: {
          rol_id: tecnicoRole.id,
          permiso_id: salesPermission.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ Permiso SALES_VIEW asignado al rol TECNICO');
    }

    console.log('🎉 Permiso SALES_VIEW agregado exitosamente');
  } catch (error) {
    console.error('❌ Error al agregar permiso SALES_VIEW:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSalesPermission(); 