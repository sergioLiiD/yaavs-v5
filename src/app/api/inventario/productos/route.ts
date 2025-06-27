import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    const productos = await prisma.productos.findMany({
      include: {
        marcas: true,
        modelos: true,
        categorias: true,
        fotos_producto: true,
      },
      orderBy: {
        nombre: 'asc'
      }
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
        { error: 'No autorizado. Por favor, inicia sesión.' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('POST /api/inventario/productos - Datos recibidos:', data);
    console.log('tipoServicioId recibido:', data.tipoServicioId, typeof data.tipoServicioId);

    // Validar campos básicos requeridos
    const camposFaltantes = [];
    if (!data.nombre) camposFaltantes.push('nombre');
    if (!data.tipoServicioId) camposFaltantes.push('tipo de servicio');

    // Validar campos adicionales según el tipo
    if (data.tipo === 'PRODUCTO') {
      if (!data.marcaId) camposFaltantes.push('marca');
      if (!data.modeloId) camposFaltantes.push('modelo');
    }

    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          campos: camposFaltantes.join(', '),
          mensaje: `Por favor, proporciona los siguientes campos: ${camposFaltantes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Convertir IDs a números
    const tipoServicioId = Number(data.tipoServicioId);
    console.log('tipoServicioId después de la conversión:', tipoServicioId, typeof tipoServicioId);
    
    if (isNaN(tipoServicioId)) {
      return NextResponse.json(
        { 
          error: 'Error de validación',
          mensaje: 'El ID del tipo de servicio debe ser un número válido'
        },
        { status: 400 }
      );
    }
    const marcaId = data.tipo === 'PRODUCTO' ? parseInt(data.marcaId) : null;
    const modeloId = data.tipo === 'PRODUCTO' ? parseInt(data.modeloId) : null;

    // Crear el producto usando una transacción para asegurar la integridad de los datos
    const nuevoProducto = await prisma.$transaction(async (tx) => {
      // Verificar que existan todas las relaciones necesarias
      console.log('tipoServicioId antes de la consulta:', tipoServicioId, typeof tipoServicioId);
      
      const tipoServicio = await tx.tipos_servicio.findUnique({ 
        where: { 
          id: tipoServicioId 
        } 
      });

      console.log('Resultado de la consulta tipoServicio:', tipoServicio);

      let marca = null;
      let modelo = null;
      let categoria = null;

      if (data.tipo === 'PRODUCTO' && marcaId && modeloId) {
        [marca, modelo] = await Promise.all([
          tx.marcas.findUnique({ where: { id: marcaId } }),
          tx.modelos.findUnique({ where: { id: modeloId } })
        ]);
      }

      // Verificar si existe la categoría
      if (data.categoriaId) {
        categoria = await tx.categorias.findUnique({ where: { id: data.categoriaId } });
      } else {
        // Si no se proporciona categoría, usar la categoría por defecto (id: 1)
        categoria = await tx.categorias.findUnique({ where: { id: 1 } });
      }

      if (!tipoServicio) {
        throw new Error('El tipo de servicio seleccionado no existe');
      }

      if (data.tipo === 'PRODUCTO') {
        if (!marcaId || !marca) throw new Error('La marca seleccionada no existe');
        if (!modeloId || !modelo) throw new Error('El modelo seleccionado no existe');
      }

      if (!categoria) {
        throw new Error('La categoría seleccionada no existe');
      }

      // Preparar los datos para crear el producto
      const createData: any = {
        nombre: data.nombre,
        sku: data.sku || `${data.nombre}-${Date.now()}`,
        stock: data.stock || 0,
        precio_promedio: data.precioPromedio || 0,
        stock_maximo: data.stockMaximo || 0,
        stock_minimo: data.stockMinimo || 0,
        tipo: data.tipo || 'PRODUCTO',
        tipo_servicio_id: tipoServicioId,
        marca_id: data.marcaId,
        modelo_id: data.modeloId,
        categoria_id: categoria.id
      };

      // Crear el producto
      const producto = await tx.productos.create({
        data: createData,
        include: {
          marcas: true,
          modelos: true,
          categorias: true,
          tipos_servicio: true
        },
      });

      return producto;
    });

    console.log('POST /api/inventario/productos - Producto creado:', nuevoProducto);
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    
    // Manejar errores específicos con mensajes más descriptivos
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Conflicto de datos',
          mensaje: 'Ya existe un producto con el mismo SKU. Por favor, utiliza un SKU diferente.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error al crear producto',
        mensaje: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 