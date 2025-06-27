import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    console.log('Reseteando contraseña para sergio@hoom.mx...\n');

    const newPassword = 'admin123';
    const hashedPassword = await hash(newPassword, 10);

    const updatedUser = await prisma.usuario.update({
      where: { 
        email: 'sergio@hoom.mx'
      },
      data: {
        passwordHash: hashedPassword
      }
    });

    console.log('Contraseña actualizada exitosamente');
    console.log('Email:', updatedUser.email);
    console.log('Nueva contraseña:', newPassword);
    console.log('Hash generado:', hashedPassword.substring(0, 20) + '...');

  } catch (error) {
    console.error('Error al resetear contraseña:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword(); 