import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const proveedor = await prisma.proveedor.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        tipo: data.tipo,
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email,
        direccion: data.direccion,
        rfc: data.rfc,
        banco: data.banco,
        cuentaBancaria: data.cuentaBancaria,
        clabeInterbancaria: data.clabeInterbancaria,
        notas: data.notas
      }
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json(
      { error: 'Error al actualizar proveedor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Primero verificamos si el proveedor existe
    const proveedor = await prisma.proveedor.findUnique({
      where: {
        id: parseInt(params.id)
      }
    });

    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Verificamos si el proveedor tiene productos asociados
    const productos = await prisma.producto.findMany({
      where: {
        proveedorId: parseInt(params.id)
      }
    });

    if (productos.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el proveedor porque tiene productos asociados' },
        { status: 400 }
      );
    }

    await prisma.proveedor.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return NextResponse.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return NextResponse.json(
      { error: 'Error al eliminar proveedor' },
      { status: 500 }
    );
  }
} 