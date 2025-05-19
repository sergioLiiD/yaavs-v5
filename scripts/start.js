const { execSync } = require('child_process');
const { spawn } = require('child_process');
const http = require('http');

async function checkServerHealth(port, retries = 10, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Intento ${i + 1} de verificar el servidor en el puerto ${port}...`);
      
      const response = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/health`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve({ statusCode: res.statusCode, data: json });
            } catch (e) {
              reject(new Error('Error al parsear respuesta JSON'));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('Timeout al conectar con el servidor'));
        });
      });

      console.log('Respuesta del servidor:', response);
      return true;
    } catch (error) {
      console.error(`Error en intento ${i + 1}:`, error.message);
      if (i < retries - 1) {
        console.log(`Esperando ${delay/1000} segundos antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

async function runPrismaCommands() {
  try {
    console.log('Generando cliente de Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Cliente de Prisma generado exitosamente');

    console.log('Ejecutando migraciones...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migraciones ejecutadas exitosamente');
  } catch (error) {
    console.error('Error en comandos de Prisma:', error);
    throw error;
  }
}

async function start() {
  let server;
  
  try {
    await runPrismaCommands();

    const port = process.env.PORT || '8080';
    console.log('Configuración del entorno:');
    console.log('PORT:', port);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

    console.log('Iniciando servidor...');
    server = spawn('node', ['.next/standalone/server.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port,
        HOSTNAME: 'localhost',
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_URL: process.env.NEXTAUTH_URL
      }
    });

    // Esperar a que el servidor esté listo
    console.log('Esperando a que el servidor esté listo...');
    const isHealthy = await checkServerHealth(port);
    
    if (!isHealthy) {
      console.error('El servidor no está respondiendo después de varios intentos');
      if (server) server.kill('SIGTERM');
      process.exit(1);
    }

    console.log('Servidor iniciado y respondiendo correctamente');

    server.on('error', (error) => {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    });

    server.on('exit', (code, signal) => {
      console.log(`Servidor terminado con código ${code} y señal ${signal}`);
      if (code !== 0) {
        process.exit(code);
      }
    });

    // Manejar señales de terminación
    const handleSignal = async (signal) => {
      console.log(`Recibida señal ${signal}, cerrando servidor...`);
      if (server) {
        server.kill(signal);
        // Esperar a que el servidor se cierre
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      process.exit(0);
    };

    process.on('SIGTERM', () => handleSignal('SIGTERM'));
    process.on('SIGINT', () => handleSignal('SIGINT'));

  } catch (error) {
    console.error('Error durante el inicio:', error);
    if (server) server.kill('SIGTERM');
    process.exit(1);
  }
}

start(); 