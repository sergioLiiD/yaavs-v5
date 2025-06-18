import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';

const prisma = new PrismaClient();

async function checkAllPasswords() {
  try {
    console.log('Verificando contraseñas de todos los usuarios...\n');

    const users = await prisma.usuario.findMany({
      where: {
        activo: true
      },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        }
      }
    });

    const commonPasswords = ['admin123', 'password', '123456', 'admin', 'whoS5un0%'];

    for (const user of users) {
      console.log(`\n=== Usuario: ${user.email} ===`);
      console.log(`Nombre: ${user.nombre}`);
      console.log(`Roles: ${user.usuarioRoles.map(ur => ur.rol.nombre).join(', ') || 'SIN ROLES'}`);
      console.log(`Activo: ${user.activo}`);
      
      // Probar contraseñas comunes
      let validPassword = null;
      for (const password of commonPasswords) {
        try {
          const isValid = await compare(password, user.passwordHash);
          if (isValid) {
            validPassword = password;
            console.log(`✅ Contraseña válida: "${password}"`);
            break;
          }
        } catch (error) {
          console.log(`❌ Error al verificar "${password}":`, error);
        }
      }
      
      if (!validPassword) {
        console.log(`❌ No se encontró contraseña válida`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllPasswords(); 