const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Probar conexión básica
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Verificar si la tabla usuarios existe
    const usuariosCount = await prisma.usuarios.count();
    console.log(`📊 Número de usuarios en la base de datos: ${usuariosCount}`);
    
    // Verificar si la tabla roles existe
    const rolesCount = await prisma.roles.count();
    console.log(`📊 Número de roles en la base de datos: ${rolesCount}`);
    
    // Listar roles disponibles
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        nombre: true
      }
    });
    console.log('📋 Roles disponibles:', roles);
    
    // Probar crear un usuario de prueba (sin guardarlo)
    console.log('🧪 Probando estructura de datos para crear usuario...');
    
    const testData = {
      email: 'test@example.com',
      nombre: 'Test',
      apellido_paterno: 'User',
      apellido_materno: '',
      password_hash: 'test_hash',
      activo: true,
      updated_at: new Date(),
      created_at: new Date()
    };
    
    console.log('📝 Datos de prueba:', testData);
    
    // Verificar si hay roles disponibles para asignar
    if (roles.length > 0) {
      const testDataWithRoles = {
        ...testData,
        usuarios_roles: {
          create: [{
            rol_id: roles[0].id,
            created_at: new Date(),
            updated_at: new Date()
          }]
        }
      };
      console.log('📝 Datos de prueba con roles:', testDataWithRoles);
    }
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    
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

testDatabaseConnection(); 