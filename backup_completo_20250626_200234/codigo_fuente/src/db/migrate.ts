const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    // Conectar a la base de datos
    await client.connect();

    // Crear la extensión uuid-ossp si no existe
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Lista de archivos de migración en orden
    const migrations = [
      '20240320000000_create_precios_venta.sql',
      '20240327000000_create_usuarios.sql'
    ];

    // Ejecutar cada migración en orden
    for (const migrationFile of migrations) {
      const migrationPath = path.join(process.cwd(), 'src/db/migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await client.query(migrationSQL);
      console.log(`Migración ${migrationFile} ejecutada exitosamente`);
    }

    console.log('Todas las migraciones ejecutadas exitosamente');
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration(); 