import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/catalogo/proveedores
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/catalogo/proveedores - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('GET /api/catalogo/proveedores - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/catalogo/proveedores - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const proveedores = await prisma.proveedores.findMany({
      orderBy: { nombre: 'asc' },
      distinct: ['rfc'] // Asegurar que no haya duplicados por RFC
    });

    console.log('GET /api/catalogo/proveedores - Proveedores encontrados:', proveedores.length);
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/proveedores
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/catalogo/proveedores - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('POST /api/catalogo/proveedores - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/catalogo/proveedores - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    console.log('POST /api/catalogo/proveedores - Datos recibidos:', data);

    // Validar campos obligatorios
    const camposObligatorios = ['nombre', 'contacto', 'telefono', 'rfc', 'banco', 'cuentaBancaria', 'clabeInterbancaria'];
    const camposFaltantes = camposObligatorios.filter(campo => !data[campo]);
    
    if (camposFaltantes.length > 0) {
      console.log('POST /api/catalogo/proveedores - Campos obligatorios faltantes:', camposFaltantes);
      return NextResponse.json(
        { error: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tipo
    if (data.tipo && !['FISICA', 'MORAL'].includes(data.tipo)) {
      console.log('POST /api/catalogo/proveedores - Tipo inválido:', data.tipo);
      return NextResponse.json(
        { error: 'El tipo debe ser FISICA o MORAL' },
        { status: 400 }
      );
    }

    // Validar email si se proporciona
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      console.log('POST /api/catalogo/proveedores - Email inválido:', data.email);
      return NextResponse.json(
        { error: 'El email proporcionado no es válido' },
        { status: 400 }
      );
    }

    // Validar CLABE
    if (data.clabeInterbancaria && !/^\d{18}$/.test(data.clabeInterbancaria)) {
      console.log('POST /api/catalogo/proveedores - CLABE inválida:', data.clabeInterbancaria);
      return NextResponse.json(
        { error: 'La CLABE debe tener 18 dígitos' },
        { status: 400 }
      );
    }

    // Validar que el RFC no esté duplicado
    const proveedorExistente = await prisma.proveedores.findFirst({
      where: {
        rfc: data.rfc
      }
    });

    if (proveedorExistente) {
      console.log('POST /api/catalogo/proveedores - RFC duplicado:', data.rfc);
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese RFC' },
        { status: 400 }
      );
    }

    // Crear el proveedor
    const proveedor = await prisma.proveedores.create({
      data: {
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
        notas: data.notas || null,
        tipo: data.tipo || 'FISICA',
        rfc: data.rfc,
        banco: data.banco,
        cuenta_bancaria: data.cuentaBancaria,
        clabe_interbancaria: data.clabeInterbancaria,
        updated_at: new Date()
      }
    });

    console.log('POST /api/catalogo/proveedores - Proveedor creado:', proveedor);
    
    // Verificar que no haya duplicados
    try {
      const proveedoresDespues = await prisma.proveedores.findMany({
        where: {
          rfc: data.rfc
        }
      });
      
      console.log('POST /api/catalogo/proveedores - Proveedores con mismo RFC después de crear:', proveedoresDespues.length);
      
      if (proveedoresDespues.length > 1) {
        console.error('POST /api/catalogo/proveedores - Se detectaron duplicados después de crear el proveedor');
        // Intentar limpiar los duplicados
        const [primerProveedor, ...duplicados] = proveedoresDespues;
        for (const duplicado of duplicados) {
          await prisma.proveedores.delete({
            where: { id: duplicado.id }
          });
        }
        console.log('POST /api/catalogo/proveedores - Duplicados eliminados');
      }
    } catch (error) {
      console.error('POST /api/catalogo/proveedores - Error al verificar duplicados:', error);
      // No lanzamos el error ya que el proveedor se creó correctamente
    }
    
    return NextResponse.json(proveedor);
  } catch (error: any) {
    console.error('POST /api/catalogo/proveedores - Error:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese nombre' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al crear el proveedor' },
      { status: 500 }
    );
  }
}

// PUT /api/catalogo/proveedores/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('PUT /api/catalogo/proveedores/[id] - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('PUT /api/catalogo/proveedores/[id] - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('PUT /api/catalogo/proveedores/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    console.log('PUT /api/catalogo/proveedores/[id] - Datos recibidos:', data);

    // Validar datos requeridos
    if (!data.nombre || !data.contacto || !data.telefono || !data.tipo || !data.rfc || 
        !data.banco || !data.cuentaBancaria || !data.clabeInterbancaria) {
      console.log('PUT /api/catalogo/proveedores/[id] - Datos incompletos:', data);
      return NextResponse.json(
        { error: 'Los campos nombre, contacto, teléfono, tipo, RFC, banco, cuenta bancaria y CLABE son obligatorios' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!['FISICA', 'MORAL'].includes(data.tipo)) {
      console.log('PUT /api/catalogo/proveedores/[id] - Tipo inválido:', data.tipo);
      return NextResponse.json(
        { error: 'El tipo debe ser FISICA o MORAL' },
        { status: 400 }
      );
    }

    // Actualizar el proveedor
    const proveedores = await prisma.proveedores.update({
      where: { id: parseInt(params.id) },
      data: {
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
        notas: data.notas || null,
        tipo: data.tipo,
        rfc: data.rfc,
        banco: data.banco,
        cuenta_bancaria: data.cuentaBancaria,
        clabe_interbancaria: data.clabeInterbancaria
      }
    });

    console.log('PUT /api/catalogo/proveedores/[id] - Proveedor actualizado:', proveedores);
    return NextResponse.json(proveedores);
  } catch (error: any) {
    console.error('PUT /api/catalogo/proveedores/[id] - Error:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese nombre' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el proveedor' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalogo/proveedores/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('DELETE /api/catalogo/proveedores/[id] - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('DELETE /api/catalogo/proveedores/[id] - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('DELETE /api/catalogo/proveedores/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Eliminar el proveedor
    await prisma.proveedores.delete({
      where: { id: parseInt(params.id) }
    });

    console.log('DELETE /api/catalogo/proveedores/[id] - Proveedor eliminado');
    return NextResponse.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('DELETE /api/catalogo/proveedores/[id] - Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el proveedor' },
      { status: 500 }
    );
  }
} 