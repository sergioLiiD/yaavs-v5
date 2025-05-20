import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        telefonoCelular: data.telefonoCelular,
        telefonoContacto: data.telefonoContacto,
        email: data.email,
        rfc: data.rfc,
        calle: data.calle,
        numeroExterior: data.numeroExterior,
        numeroInterior: data.numeroInterior,
        colonia: data.colonia,
        ciudad: data.ciudad,
        estado: data.estado,
        codigoPostal: data.codigoPostal,
        latitud: data.latitud,
        longitud: data.longitud,
        fuenteReferencia: data.fuenteReferencia,
      },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoCelular: true,
        telefonoContacto: true,
        email: true,
        calle: true,
        numeroExterior: true,
        numeroInterior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigoPostal: true,
        latitud: true,
        longitud: true,
        fuenteReferencia: true,
        rfc: true,
        activo: true,
        tipoRegistro: true,
        createdAt: true,
        updatedAt: true
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
    await prisma.cliente.delete({
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