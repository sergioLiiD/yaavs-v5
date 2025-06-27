import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Probando login con admin@puntouno.com...\n');

    const user = await prisma.usuario.findUnique({
      where: { 
        email: 'admin@puntouno.com',
        activo: true
      },
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
        },
        puntosRecoleccion: {
          include: {
            puntoRecoleccion: true
          }
        }
      }
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('Usuario encontrado:', user.email);
    console.log('Nombre:', user.nombre);
    console.log('Activo:', user.activo);
    console.log('Roles:', user.usuarioRoles.map(ur => ur.rol.nombre));

    // Probar contraseñas comunes
    const testPasswords = ['admin123', 'password', '123456', 'admin', 'whoS5un0%', 'puntouno123'];
    
    for (const password of testPasswords) {
      try {
        const isValid = await compare(password, user.passwordHash);
        console.log(`Contraseña "${password}": ${isValid ? 'VÁLIDA' : 'inválida'}`);
        if (isValid) {
          console.log('¡Contraseña encontrada!');
          break;
        }
      } catch (error) {
        console.log(`Error al verificar "${password}":`, error);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin(); 