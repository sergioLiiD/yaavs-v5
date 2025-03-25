import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Definir el tipo de usuario extendido
interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  nivel?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('GET /api/inventario/productos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/inventario/productos - No autorizado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        marca: true,
        modelo: true,
        proveedor: true,
        fotos: true,
      },
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/inventario/productos - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('POST /api/inventario/productos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/inventario/productos - No autorizado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('POST /api/inventario/productos - Datos recibidos:', data);

    // Validar campos requeridos
    if (!data.nombre || !data.categoriaId || !data.marcaId || 
        !data.modeloId || !data.proveedorId) {
      console.log('POST /api/inventario/productos - Campos requeridos faltantes:', {
        nombre: !data.nombre,
        categoriaId: !data.categoriaId,
        marcaId: !data.marcaId,
        modeloId: !data.modeloId,
        proveedorId: !data.proveedorId
      });
      return NextResponse.json(
        { error: 'Los campos nombre, categoría, marca, modelo y proveedor son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que las relaciones existan
    const [categoria, marca, modelo, proveedor] = await Promise.all([
      prisma.tipoServicio.findUnique({ where: { id: parseInt(data.categoriaId) } }),
      prisma.marca.findUnique({ where: { id: parseInt(data.marcaId) } }),
      prisma.modelo.findUnique({ where: { id: parseInt(data.modeloId) } }),
      prisma.proveedor.findUnique({ where: { id: parseInt(data.proveedorId) } })
    ]);

    if (!categoria || !marca || !modelo || !proveedor) {
      console.log('POST /api/inventario/productos - Relaciones no encontradas:', {
        categoria: !!categoria,
        marca: !!marca,
        modelo: !!modelo,
        proveedor: !!proveedor
      });
      return NextResponse.json(
        { error: 'Una o más relaciones (categoría, marca, modelo, proveedor) no existen' },
        { status: 400 }
      );
    }

    // Crear el producto
    const nuevoProducto = await prisma.producto.create({
      data: {
        tipo: data.tipo,
        sku: data.sku || null,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        notasInternas: data.notasInternas || null,
        garantiaValor: data.garantiaValor,
        garantiaUnidad: data.garantiaUnidad,
        categoriaId: parseInt(data.categoriaId),
        marcaId: parseInt(data.marcaId),
        modeloId: parseInt(data.modeloId),
        proveedorId: parseInt(data.proveedorId),
      },
      include: {
        categoria: true,
        marca: true,
        modelo: true,
        proveedor: true,
        fotos: true,
      },
    });

    console.log('POST /api/inventario/productos - Producto creado:', nuevoProducto);
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un producto con el mismo SKU' },
        { status: 400 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Una o más relaciones (categoría, marca, modelo, proveedor) no existen' },
        { status: 400 }
      );
    }

    // Para otros errores, devolver más detalles
    return NextResponse.json(
      { 
        error: 'Error al crear el producto',
        details: error.message,
        code: error.code,
        meta: error.meta
      },
      { status: 500 }
    );
  }
} 