import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const cliente = await prisma.clientes.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellido_paterno: data.apellidoPaterno,
        apellido_materno: data.apellidoMaterno,
        telefono_celular: data.telefonoCelular,
        telefono_contacto: data.telefonoContacto,
        email: data.email,
        rfc: data.rfc,
        calle: data.calle,
        numero_exterior: data.numeroExterior,
        numero_interior: data.numeroInterior,
        colonia: data.colonia,
        ciudad: data.ciudad,
        estado: data.estado,
        codigo_postal: data.codigoPostal,
        latitud: data.latitud,
        longitud: data.longitud,
        fuente_referencia: data.fuenteReferencia,
        updated_at: new Date()
      },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        telefono_celular: true,
        telefono_contacto: true,
        email: true,
        calle: true,
        numero_exterior: true,
        numero_interior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigo_postal: true,
        latitud: true,
        longitud: true,
        fuente_referencia: true,
        rfc: true,
        tipo_registro: true,
        created_at: true,
        updated_at: true
      }
    });
    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.clientes.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cliente' },
      { status: 500 }
    );
  }
} 