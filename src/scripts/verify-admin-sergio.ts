import { prisma } from '@/lib/prisma';
import { NivelUsuario } from '@/types/usuario';

async function verifyAdminUser() {
  try {
    const email = 'sergio@hoom.mx';

    // Buscar el usuario
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    });

    if (!usuario) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('Datos actuales del usuario:');
    console.log('Nombre:', `${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno || ''}`);
    console.log('Email:', usuario.email);
    console.log('Nivel:', usuario.nivel);
    console.log('Activo:', usuario.activo);

    // Si no es administrador, actualizarlo
    if (usuario.nivel !== NivelUsuario.ADMINISTRADOR) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { nivel: NivelUsuario.ADMINISTRADOR }
      });
      console.log('\nUsuario actualizado a nivel ADMINISTRADOR');
    } else {
      console.log('\nEl usuario ya tiene nivel ADMINISTRADOR');
    }
  } catch (error) {
    console.error('Error al verificar el usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdminUser(); 