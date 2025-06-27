const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'sergio@hoom.mx';
  const password = 'whoS5un0%'; // Contraseña correcta con cero

  try {
    // Generar nuevo hash
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash generado:', passwordHash);

    // Actualizar usuario
    const updatedUser = await prisma.usuario.update({
      where: { email },
      data: {
        passwordHash,
        updatedAt: new Date()
      }
    });

    console.log('Usuario actualizado:', {
      id: updatedUser.id,
      email: updatedUser.email
    });

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('¿El hash es válido?', isValid ? '✅ Sí' : '❌ No');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 