import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function createAdminUser() {
  try {
    const email = 'admin@yaavs.com';
    const password = 'Admin123!';
    const nombre = 'Administrador';
    const apellido_paterno = 'Sistema';
    const tipo_usuario = 'ADMIN';

    // Verificar si el usuario ya existe
    const { rows } = await sql`
      SELECT id FROM usuarios WHERE email = ${email}
    `;

    if (rows.length > 0) {
      console.log('El usuario administrador ya existe');
      return;
    }

    // Crear el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insertar el usuario administrador
    await sql`
      INSERT INTO usuarios (
        email,
        password_hash,
        nombre,
        apellido_paterno,
        tipo_usuario,
        activo
      ) VALUES (
        ${email},
        ${password_hash},
        ${nombre},
        ${apellido_paterno},
        ${tipo_usuario},
        true
      )
    `;

    console.log('Usuario administrador creado exitosamente');
    console.log('Email:', email);
    console.log('Contraseña:', password);
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  }
}

createAdminUser(); 