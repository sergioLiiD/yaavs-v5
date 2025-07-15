const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Listando usuarios...');
    
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        activo: true,
        usuarios_roles: {
          include: {
            roles: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`\n📋 Total de usuarios: ${users.length}\n`);
    
    users.forEach(user => {
      const roles = user.usuarios_roles.map(ur => ur.roles.nombre).join(', ');
      console.log(`👤 ${user.nombre} (${user.email}) - ID: ${user.id} - Activo: ${user.activo} - Roles: ${roles}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 