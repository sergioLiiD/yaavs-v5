import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsRepairPoint } from '@/lib/auth-repair-point';
import prisma from '@/lib/db/prisma';
import { 
  Prisma, 
  Usuario, 
  PuntoRecoleccion, 
  Rol, 
  Permiso,
  UsuarioPuntoRecoleccion,
  UsuarioRol,
  RolPermiso
} from '@prisma/client';

type UsuarioWithRelations = Usuario & {
  puntosRecoleccion: (UsuarioPuntoRecoleccion & {
    puntoRecoleccion: PuntoRecoleccion;
  })[];
  usuarioRoles: (UsuarioRol & {
    rol: Rol & {
      permisos: (RolPermiso & {
        permiso: Permiso;
      })[];
    };
  })[];
};

export async function GET() {
  try {
    const session = await getServerSession(authOptionsRepairPoint);

    if (!session?.user?.id) {
      return NextResponse.json(
        { hasAccess: false, message: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    // Buscar el usuario con sus relaciones
    const user = await prisma.usuario.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        puntosRecoleccion: {
          include: {
            puntoRecoleccion: true,
          },
        },
        usuarioRoles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true,
                  },
                },
              },
            },
          },
        },
      },
    }) as UsuarioWithRelations | null;

    if (!user) {
      return NextResponse.json(
        { hasAccess: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario tiene un punto de recolección asignado
    const hasPuntoRecoleccion = user.puntosRecoleccion.length > 0;

    // Obtener el rol del usuario
    const userRole = user.usuarioRoles[0]?.rol;
    const isAdmin = userRole?.nombre === 'ADMINISTRADOR' || userRole?.nombre === 'ADMINISTRADOR_PUNTO';

    // Si es administrador general o tiene punto de recolección, dar acceso
    const hasAccess = userRole?.nombre === 'ADMINISTRADOR' || hasPuntoRecoleccion;

    // Obtener los permisos
    const permissions = user.usuarioRoles.flatMap(ur => 
      ur.rol.permisos.map((rp: RolPermiso & { permiso: Permiso }) => rp.permiso.nombre)
    );

    // Obtener el punto de recolección
    const puntoRecoleccion = user.puntosRecoleccion[0]?.puntoRecoleccion;

    return NextResponse.json({
      hasAccess,
      isAdmin,
      user: {
        ...user,
        role: userRole?.nombre,
        permissions,
        puntoRecoleccion,
      },
    });
  } catch (error) {
    console.error('Error verificando acceso:', error);
    return NextResponse.json(
      { hasAccess: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 