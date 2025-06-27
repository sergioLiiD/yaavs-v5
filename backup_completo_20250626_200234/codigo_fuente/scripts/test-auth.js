const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'sergio@hoom.mx';
    const password = 'whoS5uno%';

    console.log('=== INICIO DEL PROCESO DE AUTENTICACIÓN ===');
    console.log('Credenciales a usar:', { email, password });

    // 1. Buscar el usuario
    console.log('\n1. Buscando usuario...');
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      roles: user.roles.map(ur => ur.rol.nombre)
    });

    // 2. Verificar el hash actual
    console.log('\n2. Verificando hash actual...');
    console.log('Hash en la base de datos:', user.passwordHash);

    // 3. Generar un nuevo hash para comparar
    console.log('\n3. Generando nuevo hash para comparar...');
    const newHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash generado:', newHash);

    // 4. Comparar contraseñas
    console.log('\n4. Comparando contraseñas...');
    const isValidCurrent = await bcrypt.compare(password, user.passwordHash);
    console.log('¿Contraseña coincide con hash actual?', isValidCurrent ? '✅ Sí' : '❌ No');

    const isValidNew = await bcrypt.compare(password, newHash);
    console.log('¿Contraseña coincide con nuevo hash?', isValidNew ? '✅ Sí' : '❌ No');

    // 5. Actualizar el hash si es necesario
    if (!isValidCurrent) {
      console.log('\n5. Actualizando hash en la base de datos...');
      const updatedUser = await prisma.usuario.update({
        where: { email },
        data: {
          passwordHash: newHash,
          updatedAt: new Date()
        }
      });
      console.log('✅ Hash actualizado');
    }

    // 6. Verificación final
    console.log('\n6. Verificación final...');
    const finalUser = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    const finalCheck = await bcrypt.compare(password, finalUser.passwordHash);
    console.log('¿Contraseña coincide después de actualización?', finalCheck ? '✅ Sí' : '❌ No');

    console.log('\n=== FIN DEL PROCESO DE AUTENTICACIÓN ===');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 