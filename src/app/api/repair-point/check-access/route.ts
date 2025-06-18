import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { hasAccess: false, message: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    const userRole = session.user.role;
    const userPermissions = session.user.permissions || [];
    const puntoRecoleccion = session.user.puntoRecoleccion;

    // Si es administrador general o tiene punto de recolección, dar acceso
    const hasAccess = userRole === 'ADMINISTRADOR' || puntoRecoleccion;
    const isAdmin = userRole === 'ADMINISTRADOR' || userRole === 'ADMINISTRADOR_PUNTO';

    return NextResponse.json({
      hasAccess,
      isAdmin,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: userRole,
        permissions: userPermissions,
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