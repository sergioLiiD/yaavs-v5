import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/cupones/[id] - Obtener un cupón específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const cupon = await prisma.cupones.findUnique({
      where: { id },
    })

    if (!cupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    return NextResponse.json(cupon)
  } catch (error) {
    console.error('Error al obtener cupón:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/cupones/[id] - Actualizar un cupón
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const {
      codigo,
      nombre,
      descripcion,
      tipo,
      tipo_descuento,
      valor_descuento,
      monto_minimo,
      fecha_inicio,
      fecha_expiracion,
      limite_usos,
      activo,
    } = body

    // Verificar si el cupón existe
    const existingCupon = await prisma.cupones.findUnique({
      where: { id },
    })

    if (!existingCupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    // Validaciones
    if (tipo_descuento === 'PORCENTAJE' && valor_descuento && (valor_descuento < 0 || valor_descuento > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    if (tipo_descuento === 'MONTO_FIJO' && valor_descuento && valor_descuento < 0) {
      return NextResponse.json(
        { error: 'El monto de descuento no puede ser negativo' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe (si se está cambiando)
    if (codigo && codigo !== existingCupon.codigo) {
      const duplicateCupon = await prisma.cupones.findUnique({
        where: { codigo },
      })

      if (duplicateCupon) {
        return NextResponse.json(
          { error: 'Ya existe un cupón con este código' },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {}
    
    if (codigo !== undefined) updateData.codigo = codigo
    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (tipo !== undefined) updateData.tipo = tipo
    if (tipo_descuento !== undefined) updateData.tipo_descuento = tipo_descuento
    if (valor_descuento !== undefined) updateData.valor_descuento = valor_descuento
    if (monto_minimo !== undefined) updateData.monto_minimo = monto_minimo
    if (fecha_inicio !== undefined) updateData.fecha_inicio = new Date(fecha_inicio)
    if (fecha_expiracion !== undefined) updateData.fecha_expiracion = new Date(fecha_expiracion)
    if (limite_usos !== undefined) updateData.limite_usos = limite_usos
    if (activo !== undefined) updateData.activo = activo

    updateData.updated_at = new Date()

    const cupon = await prisma.cupones.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(cupon)
  } catch (error) {
    console.error('Error al actualizar cupón:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/cupones/[id] - Eliminar un cupón
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar si el cupón existe
    const existingCupon = await prisma.cupones.findUnique({
      where: { id },
    })

    if (!existingCupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    // Verificar si el cupón tiene usos
    const usos = await prisma.usos_cupon.findMany({
      where: { cupon_id: id },
    })

    if (usos.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cupón que ya ha sido utilizado' },
        { status: 400 }
      )
    }

    await prisma.cupones.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cupón eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar cupón:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
