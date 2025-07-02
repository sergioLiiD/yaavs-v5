const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testCreateUser() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🧪 Probando creación de usuario...');
    
    // Simular los datos que envía el frontend
    const body = {
      email: 'test2@example.com',
      nombre: 'Test',
      apellidoPaterno: 'User',
      apellidoMaterno: '',
      password: '123456',
      confirmPassword: '123456',
      activo: true,
      roles: [15] // ID del rol ADMINISTRADOR
    };
    
    console.log('📝 Datos recibidos:', { ...body, password: '[REDACTED]' });
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email: body.email }
    });

    if (usuarioExistente) {
      console.log('❌ Email ya registrado:', body.email);
      return;
    }
    
    console.log('✅ Email disponible');
    
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(body.password, salt);
    console.log('✅ Contraseña encriptada');
    
    // Crear el usuario
    console.log('🔄 Creando usuario...');
    const usuario = await prisma.usuarios.create({
      data: {
        email: body.email,
        nombre: body.nombre,
        apellido_paterno: body.apellidoPaterno,
        apellido_materno: body.apellidoMaterno || '',
        password_hash: passwordHash,
        activo: body.activo,
        updated_at: new Date(),
        created_at: new Date(),
        usuarios_roles: {
          create: body.roles?.map((rolId) => ({
            rol_id: rolId,
            created_at: new Date(),
            updated_at: new Date()
          })) || []
        }
      },
      include: {
        usuarios_roles: {
          include: {
            roles: {
              include: {
                roles_permisos: {
                  include: {
                    permisos: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    console.log('✅ Usuario creado exitosamente:', usuario.id);
    console.log('📋 Datos del usuario creado:', {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      activo: usuario.activo,
      roles_count: usuario.usuarios_roles?.length || 0
    });
    
    // Limpiar el usuario de prueba
    console.log('🧹 Limpiando usuario de prueba...');
    await prisma.usuarios_roles.deleteMany({
      where: { usuario_id: usuario.id }
    });
    await prisma.usuarios.delete({
      where: { id: usuario.id }
    });
    console.log('✅ Usuario de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    
    if (error.meta) {
      console.error('Meta datos del error:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testCreateUser(); 