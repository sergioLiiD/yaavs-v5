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
    const roles = await prisma.rol.findMany({
      select: {
        id: true,
        nombre: true
      }
    });
    console.log('Roles existentes:', roles);
    
    // Obtener técnicos usando Prisma
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

    console.log('GET /api/usuarios/tecnicos - Técnicos encontrados:', tecnicos.length);
    console.log('GET /api/usuarios/tecnicos - Datos de técnicos:', JSON.stringify(tecnicos, null, 2));
    
    if (tecnicos.length === 0) {
      console.log('GET /api/usuarios/tecnicos - No se encontraron técnicos');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(tecnicos);
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los técnicos' },
      { status: 500 }
    );
  }
} 