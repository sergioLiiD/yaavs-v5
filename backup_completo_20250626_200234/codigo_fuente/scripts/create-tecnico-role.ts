import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando creación del rol TÉCNICO...');

    // 1. Crear el rol TECNICO si no existe
    const tecnicoRole = await prisma.rol.upsert({
      where: { nombre: 'TECNICO' },
      update: {},
      create: {
        nombre: 'TECNICO',
        descripcion: 'Rol para técnicos con acceso a tickets y reparaciones'
      }
    });

    console.log('✅ Rol TECNICO creado/verificado');

    // 2. Definir los permisos que debe tener un técnico
    const permisosTecnico = [
      'DASHBOARD_VIEW',
      'TICKETS_VIEW',
      'TICKETS_VIEW_DETAIL',
      'TICKETS_EDIT',
      'REPAIRS_VIEW',
      'REPAIRS_EDIT',
      'CLIENTS_VIEW' // Los técnicos necesitan ver clientes para trabajar con tickets
    ];

    // 3. Obtener los permisos de la base de datos
    const permisos = await prisma.permiso.findMany({
      where: {
        codigo: {
          in: permisosTecnico
        }
      }
    });

    console.log(`✅ Permisos encontrados: ${permisos.length}`);

    // 4. Asignar permisos al rol TECNICO
    for (const permiso of permisos) {
      await prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId: tecnicoRole.id,
            permisoId: permiso.id
          }
        },
        update: {},
        create: {
          rolId: tecnicoRole.id,
          permisoId: permiso.id
        }
      });
    }

    console.log('✅ Permisos asignados al rol TECNICO');

    // 5. Crear o actualizar usuario técnico
    const tecnicoPassword = await bcrypt.hash('tecnico123', 10);
    const tecnico = await prisma.usuario.upsert({
      where: { email: 'tecnico@example.com' },
      update: {
        nombre: 'Técnico',
        apellidoPaterno: 'Técnico',
        apellidoMaterno: '',
        passwordHash: tecnicoPassword,
        activo: true,
      },
      create: {
        email: 'tecnico@example.com',
        nombre: 'Técnico',
        apellidoPaterno: 'Técnico',
        apellidoMaterno: '',
        passwordHash: tecnicoPassword,
        activo: true,
      }
    });

    console.log('✅ Usuario técnico creado/actualizado');

    // 6. Asignar el rol TECNICO al usuario
    await prisma.usuarioRol.upsert({
      where: {
        usuarioId_rolId: {
          usuarioId: tecnico.id,
          rolId: tecnicoRole.id
        }
      },
      update: {},
      create: {
        usuarioId: tecnico.id,
        rolId: tecnicoRole.id
      }
    });

    console.log('✅ Rol TECNICO asignado al usuario');

    // 7. Verificar la creación
    const usuarioVerificado = await prisma.usuario.findUnique({
      where: { email: 'tecnico@example.com' },
      include: {
        usuarioRoles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (usuarioVerificado) {
      console.log('\n🎉 Proceso completado exitosamente!');
      console.log('\nCredenciales de acceso:');
      console.log('Email: tecnico@example.com');
      console.log('Contraseña: tecnico123');
      console.log('\nRoles asignados:');
      usuarioVerificado.usuarioRoles.forEach((ur) => {
        console.log(`- ${ur.rol.nombre}`);
        console.log('  Permisos:');
        ur.rol.permisos.forEach((rp) => {
          console.log(`  - ${rp.permiso.nombre} (${rp.permiso.codigo})`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error durante la creación del rol técnico:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 