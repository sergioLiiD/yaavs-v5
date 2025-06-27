import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando asignación de usuario técnico al rol TECNICO...');

    // 1. Buscar el rol TECNICO existente (ID 18 según tu log)
    const tecnicoRole = await prisma.rol.findUnique({
      where: { id: 18 }
    });

    if (!tecnicoRole) {
      console.log('❌ No se encontró el rol TECNICO con ID 18');
      return;
    }

    console.log('✅ Rol TECNICO encontrado:', tecnicoRole.nombre);

    // 2. Buscar usuarios técnicos existentes
    const usuariosTecnicos = await prisma.usuario.findMany({
      where: {
        OR: [
          { email: { contains: 'tecnico' } },
          { email: { contains: 'arregla' } },
          { nombre: { contains: 'Técnico' } }
        ]
      },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    });

    console.log(`✅ Usuarios técnicos encontrados: ${usuariosTecnicos.length}`);
    usuariosTecnicos.forEach(usuario => {
      console.log(`- ${usuario.email} (${usuario.nombre} ${usuario.apellidoPaterno})`);
      console.log(`  Roles actuales: ${usuario.usuarioRoles.map(ur => ur.rol.nombre).join(', ')}`);
    });

    // 3. Si no hay usuarios técnicos, crear uno
    let usuarioTecnico = usuariosTecnicos[0];
    
    if (!usuarioTecnico) {
      console.log('No se encontraron usuarios técnicos, creando uno nuevo...');
      
      const tecnicoPassword = await bcrypt.hash('tecnico123', 10);
      usuarioTecnico = await prisma.usuario.create({
        data: {
          email: 'tecnico@arregla.mx',
          nombre: 'Técnico',
          apellidoPaterno: 'Central',
          apellidoMaterno: '',
          passwordHash: tecnicoPassword,
          activo: true,
        },
        include: {
          usuarioRoles: {
            include: {
              rol: true
            }
          }
        }
      });
      console.log('✅ Usuario técnico creado:', usuarioTecnico.email);
    }

    // 4. Verificar si ya tiene el rol TECNICO asignado
    const yaTieneRol = usuarioTecnico.usuarioRoles.some(ur => ur.rol.id === tecnicoRole.id);
    
    if (yaTieneRol) {
      console.log('✅ El usuario ya tiene el rol TECNICO asignado');
    } else {
      // 5. Asignar el rol TECNICO al usuario
      await prisma.usuarioRol.create({
        data: {
          usuarioId: usuarioTecnico.id,
          rolId: tecnicoRole.id
        }
      });
      console.log('✅ Rol TECNICO asignado al usuario');
    }

    // 6. Verificar la asignación
    const usuarioVerificado = await prisma.usuario.findUnique({
      where: { id: usuarioTecnico.id },
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
      console.log(`Email: ${usuarioVerificado.email}`);
      console.log('Contraseña: tecnico123 (si es nuevo) o la que ya tenías');
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
    console.error('❌ Error durante la asignación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 