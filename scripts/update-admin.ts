import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar si el rol de administrador existe
    let adminRole = await prisma.rol.findFirst({
      where: { nombre: 'ADMINISTRADOR' }
    });

    if (!adminRole) {
      console.log('Creando rol de administrador...');
      adminRole = await prisma.rol.create({
        data: {
          nombre: 'ADMINISTRADOR',
          descripcion: 'Administrador del sistema'
        }
      });
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: 'sergio@hoom.mx' }
    });

    const hashedPassword = await bcrypt.hash('whos%un0%', 10);

    if (existingUser) {
      console.log('Actualizando usuario existente...');
      // Actualizar contraseña
      await prisma.usuario.update({
        where: { email: 'sergio@hoom.mx' },
        data: {
          passwordHash: hashedPassword
        }
      });
      // Eliminar relaciones previas en UsuarioRol
      await prisma.usuarioRol.deleteMany({
        where: { usuarioId: existingUser.id }
      });
      // Crear nueva relación con el rol de administrador
      await prisma.usuarioRol.create({
        data: {
          usuarioId: existingUser.id,
          rolId: adminRole.id
        }
      });
    } else {
      console.log('Creando nuevo usuario administrador...');
      const newUser = await prisma.usuario.create({
        data: {
          email: 'sergio@hoom.mx',
          nombre: 'Sergio',
          apellidoPaterno: 'Admin',
          apellidoMaterno: null,
          passwordHash: hashedPassword,
          activo: true
        }
      });
      await prisma.usuarioRol.create({
        data: {
          usuarioId: newUser.id,
          rolId: adminRole.id
        }
      });
    }

    console.log('Usuario administrador actualizado exitosamente');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 