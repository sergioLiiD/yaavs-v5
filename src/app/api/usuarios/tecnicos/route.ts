import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('GET /api/usuarios/tecnicos - Consultando técnicos...');
    
    // Obtener técnicos usando Prisma
    const tecnicos = await prisma.usuario.findMany({
      where: {
        usuarioRoles: {
          some: {
            rol: {
              nombre: 'TECNICO'
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
        email: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log('GET /api/usuarios/tecnicos - Técnicos encontrados:', tecnicos.length);
    
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