import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('Iniciando POST /api/inventario/stock/entradas');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user) {
      console.log('No hay sesión o usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(session.user.id) }
    });

    console.log('Buscando usuario con ID:', session.user.id);
    console.log('Usuario encontrado:', usuario);

    if (!usuario) {
      console.log('Usuario no encontrado en la base de datos');
      return new NextResponse('Usuario no encontrado', { status: 404 });
    }

    const body = await request.json();
    console.log('Body recibido:', body);
    const { productoId, cantidad, precioCompra, notas, proveedorId } = body;

    if (!productoId || !cantidad || !precioCompra || !proveedorId) {
      console.log('Faltan campos requeridos');
      return new NextResponse('Faltan campos requeridos', { status: 400 });
    }

    // Validar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: Number(productoId) },
      select: {
        id: true,
        stock: true,
        precioPromedio: true,
      },
    });

    console.log('Producto encontrado:', producto);

    if (!producto) {
      console.log('Producto no encontrado');
      return new NextResponse('Producto no encontrado', { status: 404 });
    }

    // Validar que el proveedor existe
    const proveedores = await prisma.proveedor.findUnique({
      where: { id: Number(proveedorId) },
    });

    if (!proveedores) {
      console.log('Proveedor no encontrado');
      return new NextResponse('Proveedor no encontrado', { status: 404 });
    }

    // Calcular el nuevo precio promedio
    const nuevoStock = (producto.stock || 0) + Number(cantidad);
    const nuevoPrecioPromedio = ((producto.precioPromedio || 0) * (producto.stock || 0) + (Number(precioCompra) * Number(cantidad))) / nuevoStock;

    console.log('Nuevo stock:', nuevoStock);
    console.log('Nuevo precio promedio:', nuevoPrecioPromedio);

    try {
      // Crear la entrada y actualizar el producto en una transacción
      const [entrada] = await prisma.$transaction([
        prisma.entradaAlmacen.create({
          data: {
            productoId: Number(productoId),
            cantidad: Number(cantidad),
            precioCompra: Number(precioCompra),
            notas,
            usuarioId: parseInt(session.user.id),
            proveedorId: Number(proveedorId)
          }
        }),
        prisma.producto.update({
          where: { id: Number(productoId) },
          data: {
            stock: nuevoStock,
            precioPromedio: nuevoPrecioPromedio
          }
        })
      ]);

      console.log('Entrada creada:', entrada);
      return NextResponse.json(entrada);
    } catch (error) {
      console.error('Error en la transacción:', error);
      return new NextResponse(`Error en la transacción: ${error instanceof Error ? error.message : 'Error desconocido'}`, { status: 500 });
    }
  } catch (error) {
    console.error('Error detallado al registrar entrada:', error);
    return new NextResponse(`Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`, { status: 500 });
  }
} 