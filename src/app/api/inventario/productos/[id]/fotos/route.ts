import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// Función para guardar la foto en el sistema de archivos
async function saveFoto(foto: File, productoId: number): Promise<string> {
  const bytes = await foto.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Crear nombre único para la foto
  const extension = foto.name.split('.').pop();
  const fileName = `${uuidv4()}.${extension}`;
  const relativePath = `/uploads/productos/${productoId}/${fileName}`;
  const absolutePath = join(process.cwd(), 'public', relativePath);

  // Crear directorio si no existe
  const dir = join(process.cwd(), 'public', 'uploads', 'productos', productoId.toString());
  await mkdir(dir, { recursive: true });

  // Guardar archivo
  await writeFile(absolutePath, buffer);
  return relativePath;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !['ADMINISTRADOR', 'GERENTE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const fotos = formData.getAll('fotos') as File[];

    if (fotos.length === 0) {
      return NextResponse.json(
        { error: 'No se han proporcionado fotos' },
        { status: 400 }
      );
    }

    const productoId = parseInt(params.id);

    // Verificar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const fotosGuardadas = [];
    for (const foto of fotos) {
      // Guardar foto en el sistema de archivos
      const url = await saveFoto(foto, productoId);

      // Crear registro en la base de datos
      const fotoProducto = await prisma.fotoProducto.create({
        data: {
          url,
          productoId,
        },
      });

      fotosGuardadas.push(fotoProducto);
    }

    return NextResponse.json(fotosGuardadas, { status: 201 });
  } catch (error) {
    console.error('Error al subir fotos:', error);
    return NextResponse.json(
      { error: 'Error al subir fotos' },
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
    if (!session?.user?.role || !['ADMINISTRADOR', 'GERENTE'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fotoId = searchParams.get('fotoId');

    if (!fotoId) {
      return NextResponse.json(
        { error: 'ID de foto no proporcionado' },
        { status: 400 }
      );
    }

    // Obtener la foto
    const foto = await prisma.fotoProducto.findFirst({
      where: {
        id: parseInt(fotoId),
        productoId: parseInt(params.id),
      },
    });

    if (!foto) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar archivo del sistema de archivos
    const absolutePath = join(process.cwd(), 'public', foto.url);
    await unlink(absolutePath);

    // Eliminar registro de la base de datos
    await prisma.fotoProducto.delete({
      where: { id: parseInt(fotoId) },
    });

    return NextResponse.json({ message: 'Foto eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar foto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar foto' },
      { status: 500 }
    );
  }
} 