const { execSync } = require('child_process');
const { spawn } = require('child_process');
const http = require('http');

async function checkServerHealth(port, retries = 5, delay = 2000) {
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
        
        req.setTimeout(5000, () => {
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

async function start() {
  try {
    console.log('Generando cliente de Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Ejecutando migraciones...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    const port = process.env.PORT || '8080';
    console.log('Configuración del entorno:');
    console.log('PORT:', port);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

    console.log('Iniciando servidor...');
    const server = spawn('node', ['.next/standalone/server.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port,
        HOSTNAME: '0.0.0.0',
        NODE_ENV: 'production',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    });

    // Esperar a que el servidor esté listo
    console.log('Esperando a que el servidor esté listo...');
    const isHealthy = await checkServerHealth(port);
    
    if (!isHealthy) {
      console.error('El servidor no está respondiendo después de varios intentos');
      process.exit(1);
    }

    console.log('Servidor iniciado y respondiendo correctamente');

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