import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

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
      
      const cliente = await prisma.clientes.create({
        data: {
          nombre: body.nombre,
          apellido_paterno: body.apellidoPaterno,
          apellido_materno: body.apellidoMaterno || null,
          email: body.email,
          telefono_celular: body.telefono,
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

    // Crear el cliente
    const cliente = await prisma.clientes.create({
      data: {
        nombre: body.nombre,
        apellido_paterno: body.apellidoPaterno,
        apellido_materno: body.apellidoMaterno || null,
        email: body.email,
        telefono_celular: body.telefono,
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
      puntoRecoleccionId: cliente.punto_recoleccion_id,
      createdAt: cliente.created_at,
      updatedAt: cliente.updated_at
    };

    return NextResponse.json(clienteMapeado);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
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