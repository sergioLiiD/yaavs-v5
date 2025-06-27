const { execSync } = require('child_process');

async function setupDatabase() {
  try {
    console.log('Generando cliente de Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Ejecutando migraciones...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('Ejecutando seed...');
    execSync('npx prisma db seed', { stdio: 'inherit' });

    console.log('¡Base de datos configurada exitosamente!');
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    process.exit(1);
  }
}

setupDatabase(); 