const { execSync } = require('child_process');
const { spawn } = require('child_process');

async function start() {
  try {
    console.log('Generando cliente de Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Ejecutando migraciones...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('Configuración del entorno:');
    console.log('PORT:', process.env.PORT || '3000');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

    console.log('Iniciando servidor...');
    const server = spawn('node', ['.next/standalone/server.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: process.env.PORT || '3000',
        HOSTNAME: '0.0.0.0',
        NODE_ENV: 'production'
      }
    });

    server.on('error', (error) => {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    });

    server.on('exit', (code, signal) => {
      console.log(`Servidor terminado con código ${code} y señal ${signal}`);
    });

    process.on('SIGTERM', () => {
      console.log('Recibida señal SIGTERM, cerrando servidor...');
      server.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('Recibida señal SIGINT, cerrando servidor...');
      server.kill('SIGINT');
    });

  } catch (error) {
    console.error('Error durante el inicio:', error);
    process.exit(1);
  }
}

start(); 