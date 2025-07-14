const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTecnicos() {
  try {
    console.log('🔍 Probando consulta de técnicos...');
    
    // Primero, veamos qué roles existen
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        nombre: true
      }
    });
    console.log('📋 Roles existentes:', roles);
    
    // Obtener técnicos usando la misma consulta del endpoint
    const tecnicos = await prisma.usuario.findMany({
      where: {
        usuarioRoles: {
          some: {
            rol: {
              nombre: {
                contains: 'tecnico',
                mode: 'insensitive'
              }
            }
          }
        },
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        email: true,
        usuarioRoles: {
          select: {
            rol: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log('✅ Técnicos encontrados:', tecnicos.length);
    console.log('📊 Datos de técnicos:', JSON.stringify(tecnicos, null, 2));
    
    if (tecnicos.length === 0) {
      console.log('⚠️ No se encontraron técnicos');
      
      // Veamos todos los usuarios para debug
      const todosUsuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          nombre: true,
          email: true,
          activo: true,
          usuarioRoles: {
            select: {
              rol: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      });
      
      console.log('👥 Todos los usuarios:', JSON.stringify(todosUsuarios, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTecnicos(); 