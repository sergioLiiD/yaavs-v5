import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/cupones - Obtener todos los cupones con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tipo = searchParams.get('tipo')
    const activo = searchParams.get('activo')
    const fechaDesde = searchParams.get('fecha_desde')
    const fechaHasta = searchParams.get('fecha_hasta')

    const where: any = {}

    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: 'insensitive' } },
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (activo !== null && activo !== undefined) {
      where.activo = activo === 'true'
    }

    if (fechaDesde || fechaHasta) {
      where.fecha_expiracion = {}
      if (fechaDesde) {
        where.fecha_expiracion.gte = new Date(fechaDesde)
      }
      if (fechaHasta) {
        where.fecha_expiracion.lte = new Date(fechaHasta)
      }
    }

    const cupones = await prisma.cupones.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(cupones)
  } catch (error) {
    console.error('Error al obtener cupones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/cupones - Crear un nuevo cupón
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
    } = body

    // Validaciones
    if (!codigo || !nombre || !tipo || !tipo_descuento || !valor_descuento || !fecha_inicio || !fecha_expiracion) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben estar presentes' },
        { status: 400 }
      )
    }

    if (tipo_descuento === 'PORCENTAJE' && (valor_descuento < 0 || valor_descuento > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    if (tipo_descuento === 'MONTO_FIJO' && valor_descuento < 0) {
      return NextResponse.json(
        { error: 'El monto de descuento no puede ser negativo' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    const existingCupon = await prisma.cupones.findUnique({
      where: { codigo },
    })

    if (existingCupon) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con este código' },
        { status: 400 }
      )
    }

    const cupon = await prisma.cupones.create({
      data: {
        codigo,
        nombre,
        descripcion,
        tipo,
        tipo_descuento,
        valor_descuento,
        monto_minimo: monto_minimo || 0,
        fecha_inicio: new Date(fecha_inicio),
        fecha_expiracion: new Date(fecha_expiracion),
        limite_usos,
        usos_actuales: 0,
        activo: true,
      },
    })

    return NextResponse.json(cupon, { status: 201 })
  } catch (error) {
    console.error('Error al crear cupón:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
