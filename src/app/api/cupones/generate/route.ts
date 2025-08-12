import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/cupones/generate - Generar múltiples cupones personalizados
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      cantidad,
      prefijo = '',
      nombre,
      descripcion,
      tipo_descuento,
      valor_descuento,
      monto_minimo,
      fecha_inicio,
      fecha_expiracion,
      limite_usos,
    } = body

    // Validaciones
    if (!cantidad || !nombre || !tipo_descuento || !valor_descuento || !fecha_inicio || !fecha_expiracion) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben estar presentes' },
        { status: 400 }
      )
    }

    if (cantidad < 1 || cantidad > 100) {
      return NextResponse.json(
        { error: 'La cantidad debe estar entre 1 y 100' },
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

    // Función para generar código único
    const generateUniqueCode = (prefijo: string, index: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let result = prefijo
      
      // Generar parte aleatoria
      for (let i = 0; i < 8 - prefijo.length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      
      // Agregar índice para asegurar unicidad
      result += index.toString().padStart(2, '0')
      
      return result
    }

    // Generar cupones
    const cupones = []
    const existingCodes = new Set()

    for (let i = 0; i < cantidad; i++) {
      let codigo
      let attempts = 0
      
      // Generar código único
      do {
        codigo = generateUniqueCode(prefijo, i + 1)
        attempts++
        
        if (attempts > 10) {
          return NextResponse.json(
            { error: 'No se pudo generar códigos únicos después de múltiples intentos' },
            { status: 500 }
          )
        }
      } while (existingCodes.has(codigo))
      
      existingCodes.add(codigo)

      const cupon = await prisma.cupones.create({
        data: {
          codigo,
          nombre: `${nombre} #${i + 1}`,
          descripcion,
          tipo: 'PERSONALIZADO',
          tipo_descuento,
          valor_descuento,
          monto_minimo: monto_minimo || 0,
          fecha_inicio: new Date(fecha_inicio),
          fecha_expiracion: new Date(fecha_expiracion),
          limite_usos: 1, // Cupones personalizados solo se pueden usar una vez
          usos_actuales: 0,
          activo: true,
        },
      })

      cupones.push(cupon)
    }

    return NextResponse.json(cupones, { status: 201 })
  } catch (error) {
    console.error('Error al generar cupones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
