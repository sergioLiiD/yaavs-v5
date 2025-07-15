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
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log(`\n📋 Total de usuarios: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`👤 ${user.nombre} (${user.email}) - ID: ${user.id} - Activo: ${user.activo}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 