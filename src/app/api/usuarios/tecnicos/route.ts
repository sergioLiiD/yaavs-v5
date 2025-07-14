import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('GET /api/usuarios/tecnicos - Consultando técnicos...');
    
    // Primero, veamos qué roles existen
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        nombre: true
      }
    });
    console.log('Roles existentes:', roles);
    
    // Obtener técnicos usando Prisma
    const tecnicos = await prisma.usuarios.findMany({
      where: {
        usuarios_roles: {
          some: {
            roles: {
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
        apellido_paterno: true,
        apellido_materno: true,
        email: true,
        usuarios_roles: {
          select: {
            roles: {
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

    console.log('GET /api/usuarios/tecnicos - Técnicos encontrados:', tecnicos.length);
    console.log('GET /api/usuarios/tecnicos - Datos de técnicos:', JSON.stringify(tecnicos, null, 2));
    
    if (tecnicos.length === 0) {
      console.log('GET /api/usuarios/tecnicos - No se encontraron técnicos');
      return NextResponse.json([]);
    }
    
    // Mapear los datos de snake_case a camelCase para el frontend
    const tecnicosMapeados = tecnicos.map(tecnico => ({
      id: tecnico.id,
      nombre: tecnico.nombre,
      apellidoPaterno: tecnico.apellido_paterno,
      apellidoMaterno: tecnico.apellido_materno,
      email: tecnico.email,
      usuariosRoles: tecnico.usuarios_roles?.map(ur => ({
        ...ur,
        rol: ur.roles
      }))
    }));
    
    console.log('GET /api/usuarios/tecnicos - Técnicos mapeados:', JSON.stringify(tecnicosMapeados, null, 2));
    
    return NextResponse.json(tecnicosMapeados);
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los técnicos' },
      { status: 500 }
    );
  }
} 