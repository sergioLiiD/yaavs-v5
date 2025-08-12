import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/cupones/apply-ticket - Aplicar cupón a un ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { codigo, ticket_id } = body

    if (!codigo || !ticket_id) {
      return NextResponse.json(
        { error: 'Código y ticket_id son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticket_id },
      include: {
        presupuestos: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    // Buscar el cupón
    const cupon = await prisma.cupones.findUnique({
      where: { codigo: codigo.toUpperCase() },
    })

    if (!cupon) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón no encontrado',
      })
    }

    // Validar si está activo
    if (!cupon.activo) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón inactivo',
      })
    }

    // Validar fecha de expiración
    const now = new Date()
    const fechaExpiracion = new Date(cupon.fecha_expiracion)
    
    if (fechaExpiracion < now) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón expirado',
      })
    }

    // Validar fecha de inicio
    const fechaInicio = new Date(cupon.fecha_inicio)
    if (fechaInicio > now) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón aún no está vigente',
      })
    }

    // Obtener el monto del ticket
    const montoTicket = ticket.presupuestos?.total_final || 0

    // Validar monto mínimo
    if (cupon.monto_minimo && montoTicket < cupon.monto_minimo) {
      return NextResponse.json({
        success: false,
        mensaje: `Monto mínimo requerido: $${cupon.monto_minimo.toFixed(2)}`,
      })
    }

    // Validar límite de usos
    if (cupon.limite_usos && cupon.usos_actuales >= cupon.limite_usos) {
      return NextResponse.json({
        success: false,
        mensaje: 'Cupón agotado',
      })
    }

    // Verificar si el cupón ya fue usado en este ticket
    const usoExistente = await prisma.usos_cupon.findFirst({
      where: {
        cupon_id: cupon.id,
        ticket_id: ticket_id,
      },
    })

    if (usoExistente) {
      return NextResponse.json({
        success: false,
        mensaje: 'Este cupón ya fue aplicado a este ticket',
      })
    }

    // Calcular descuento
    let descuento = 0
    if (cupon.tipo_descuento === 'PORCENTAJE') {
      descuento = (montoTicket * cupon.valor_descuento) / 100
    } else {
      descuento = cupon.valor_descuento
    }

    // Asegurar que el descuento no exceda el monto total
    if (descuento > montoTicket) {
      descuento = montoTicket
    }

    // Registrar el uso del cupón
    await prisma.usos_cupon.create({
      data: {
        cupon_id: cupon.id,
        ticket_id: ticket_id,
        usuario_id: session.user.id,
        monto_descuento: descuento,
      },
    })

    // Actualizar contador de usos del cupón
    await prisma.cupones.update({
      where: { id: cupon.id },
      data: {
        usos_actuales: {
          increment: 1,
        },
      },
    })

    // Actualizar el presupuesto del ticket con el descuento
    if (ticket.presupuestos) {
      await prisma.presupuestos.update({
        where: { ticket_id: ticket_id },
        data: {
          descuento: {
            increment: descuento,
          },
          total_final: {
            decrement: descuento,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      descuento,
      mensaje: `Descuento de $${descuento.toFixed(2)} aplicado exitosamente`,
    })
  } catch (error) {
    console.error('Error al aplicar cupón al ticket:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
