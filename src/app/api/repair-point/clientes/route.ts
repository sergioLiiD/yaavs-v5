import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si es ADMINISTRADOR, permitir crear clientes para cualquier punto
    if (session.user.role === 'ADMINISTRADOR') {
      const body = await request.json();
      
      // Verificar si el email ya existe
      const emailNormalizado = body.email?.toLowerCase().trim();
      if (!emailNormalizado) {
        return NextResponse.json(
          { error: 'El correo electrónico es requerido' },
          { status: 400 }
        );
      }
      
      const existingClient = await prisma.clientes.findUnique({
        where: { email: emailNormalizado },
        select: {
          id: true,
          nombre: true,
          apellido_paterno: true,
          email: true
        }
      });

      if (existingClient) {
        const nombreCompleto = `${existingClient.nombre} ${existingClient.apellido_paterno}`.trim();
        return NextResponse.json(
          { 
            error: 'El correo electrónico ya está registrado',
            message: `Ya existe un cliente registrado con el correo electrónico "${body.email}". Cliente: ${nombreCompleto}`,
            field: 'email',
            existingClient: {
              id: existingClient.id,
              nombre: nombreCompleto,
              email: existingClient.email
            }
          },
          { status: 400 }
        );
      }
      
      const cliente = await prisma.clientes.create({
        data: {
          nombre: body.nombre,
          apellido_paterno: body.apellidoPaterno,
          apellido_materno: body.apellidoMaterno || null,
          email: emailNormalizado, // Usar email normalizado
          telefono_celular: body.telefono,
          telefono_contacto: body.telefonoContacto || null,
          punto_recoleccion_id: body.puntoRecoleccionId || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Mapear a formato camelCase para el frontend
      const clienteMapeado = {
        id: cliente.id,
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellido_paterno,
        apellidoMaterno: cliente.apellido_materno,
        email: cliente.email,
        telefonoCelular: cliente.telefono_celular,
        telefonoContacto: cliente.telefono_contacto,
        puntoRecoleccionId: cliente.punto_recoleccion_id,
        createdAt: cliente.created_at,
        updatedAt: cliente.updated_at
      };

      return NextResponse.json(clienteMapeado);
    }

    // Para otros roles, usar el punto de recolección del usuario
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verificar si el email ya existe
    const emailNormalizado = body.email?.toLowerCase().trim();
    if (!emailNormalizado) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }
    
    const existingClient = await prisma.clientes.findUnique({
      where: { email: emailNormalizado },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        email: true
      }
    });

    if (existingClient) {
      const nombreCompleto = `${existingClient.nombre} ${existingClient.apellido_paterno}`.trim();
      return NextResponse.json(
        { 
          error: 'El correo electrónico ya está registrado',
          message: `Ya existe un cliente registrado con el correo electrónico "${body.email}". Cliente: ${nombreCompleto}`,
          field: 'email',
          existingClient: {
            id: existingClient.id,
            nombre: nombreCompleto,
            email: existingClient.email
          }
        },
        { status: 400 }
      );
    }

    // Crear el cliente
    const cliente = await prisma.clientes.create({
      data: {
        nombre: body.nombre,
        apellido_paterno: body.apellidoPaterno,
        apellido_materno: body.apellidoMaterno || null,
        email: emailNormalizado, // Usar email normalizado
        telefono_celular: body.telefono,
        telefono_contacto: body.telefonoContacto || null,
        punto_recoleccion_id: userPointId,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Mapear a formato camelCase para el frontend
    const clienteMapeado = {
      id: cliente.id,
      nombre: cliente.nombre,
      apellidoPaterno: cliente.apellido_paterno,
      apellidoMaterno: cliente.apellido_materno,
      email: cliente.email,
      telefonoCelular: cliente.telefono_celular,
      telefonoContacto: cliente.telefono_contacto,
      puntoRecoleccionId: cliente.punto_recoleccion_id,
      createdAt: cliente.created_at,
      updatedAt: cliente.updated_at
    };

    return NextResponse.json(clienteMapeado);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    // Manejar error de Prisma cuando el email ya existe (violación de constraint único)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes('email')) {
          return NextResponse.json(
            { 
              error: 'El correo electrónico ya está registrado',
              message: 'El correo electrónico proporcionado ya está en uso. Por favor, utiliza otro correo electrónico.',
              field: 'email'
            },
            { status: 400 }
          );
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear cliente',
        message: 'Ocurrió un error inesperado al intentar registrar el cliente. Por favor, intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si es ADMINISTRADOR, mostrar todos los clientes
    if (session.user.role === 'ADMINISTRADOR') {
      const clientesRaw = await prisma.clientes.findMany({
        orderBy: {
          nombre: 'asc'
        }
      });

      // Mapear los datos a formato camelCase para el frontend
      const clientes = clientesRaw.map((cliente: any) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellido_paterno,
        apellidoMaterno: cliente.apellido_materno,
        telefonoCelular: cliente.telefono_celular,
        telefonoContacto: cliente.telefono_contacto,
        email: cliente.email,
        calle: cliente.calle,
        numeroExterior: cliente.numero_exterior,
        numeroInterior: cliente.numero_interior,
        colonia: cliente.colonia,
        ciudad: cliente.ciudad,
        estado: cliente.estado,
        codigoPostal: cliente.codigo_postal,
        latitud: cliente.latitud,
        longitud: cliente.longitud,
        fuenteReferencia: cliente.fuente_referencia,
        rfc: cliente.rfc,
        tipoRegistro: cliente.tipo_registro,
        createdAt: cliente.created_at,
        updatedAt: cliente.updated_at,
        puntoRecoleccionId: cliente.punto_recoleccion_id
      }));

      return NextResponse.json(clientes);
    }

    // Para otros roles, mostrar solo clientes del punto de recolección
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener los clientes del punto de recolección
    const clientesRaw = await prisma.clientes.findMany({
      where: {
        punto_recoleccion_id: userPointId
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Mapear los datos a formato camelCase para el frontend
    const clientes = clientesRaw.map((cliente: any) => ({
      id: cliente.id,
      nombre: cliente.nombre,
      apellidoPaterno: cliente.apellido_paterno,
      apellidoMaterno: cliente.apellido_materno,
      telefonoCelular: cliente.telefono_celular,
      telefonoContacto: cliente.telefono_contacto,
      email: cliente.email,
      calle: cliente.calle,
      numeroExterior: cliente.numero_exterior,
      numeroInterior: cliente.numero_interior,
      colonia: cliente.colonia,
      ciudad: cliente.ciudad,
      estado: cliente.estado,
      codigoPostal: cliente.codigo_postal,
      latitud: cliente.latitud,
      longitud: cliente.longitud,
      fuenteReferencia: cliente.fuente_referencia,
      rfc: cliente.rfc,
      tipoRegistro: cliente.tipo_registro,
      createdAt: cliente.created_at,
      updatedAt: cliente.updated_at,
      puntoRecoleccionId: cliente.punto_recoleccion_id
    }));

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
} 