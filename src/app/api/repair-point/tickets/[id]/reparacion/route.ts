import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validarStockReparacion, procesarDescuentoInventario, convertirConceptosAPiezas } from '@/lib/inventory-utils';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    const { observaciones, checklist, fotos, videos, completar } = await request.json();

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Verificar que el ticket exista y pertenezca al punto de reparación
    const ticket = await prisma.tickets.findFirst({
      where: {
        id: ticketId,
        punto_recoleccion_id: userPoint.punto_recoleccion_id
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Si se está completando la reparación, validar stock primero
    if (completar) {
      const validacionStock = await validarStockReparacion(ticketId);
      
      if (!validacionStock.success) {
        return NextResponse.json(
          { 
            error: 'No se puede completar la reparación por falta de stock',
            detalles: validacionStock.errors,
            stockFaltante: validacionStock.missingStock
          },
          { status: 400 }
        );
      }
    }

    // Procesar en transacción si se está completando
    if (completar) {
      console.log('🔄 Iniciando transacción para completar reparación...');
      await prisma.$transaction(async (tx) => {
        // Actualizar la reparación
        console.log('📝 Actualizando reparación...');
        const reparacion = await tx.reparaciones.update({
          where: {
            ticket_id: ticketId
          },
          data: {
            observaciones,
            fecha_fin: new Date(),
            updated_at: new Date()
          }
        });
        console.log('✅ Reparación actualizada:', reparacion.id);

        // Actualizar el estado del ticket
        console.log('📝 Actualizando estado del ticket...');
        await tx.tickets.update({
          where: {
            id: ticketId
          },
          data: {
            estatus_reparacion_id: 30, // Completado - ID correcto según la base de datos
            fecha_fin_reparacion: new Date(),
            updated_at: new Date()
          }
        });
        console.log('✅ Estado del ticket actualizado');

        // Convertir conceptos del presupuesto a piezas de reparación
        console.log('🔄 Convirtiendo conceptos del presupuesto...');
        try {
          await convertirConceptosAPiezas(ticketId, reparacion.id);
          console.log('✅ Conceptos convertidos exitosamente');
        } catch (error) {
          console.error('❌ Error al convertir conceptos:', error);
          throw error;
        }

        // Procesar descuento de inventario
        console.log('🔄 Iniciando procesamiento de descuento de inventario para ticket:', ticketId);
        try {
          await procesarDescuentoInventario(ticketId, Number(session.user.id));
          console.log('✅ Descuento de inventario procesado exitosamente');
        } catch (error) {
          console.error('❌ Error al procesar descuento de inventario:', error);
          throw error;
        }
      });
    } else {
      // Solo actualizar observaciones si no se está completando
      const reparacion = await prisma.reparaciones.update({
        where: {
          ticket_id: ticketId
        },
        data: {
          observaciones,
          updated_at: new Date()
        }
      });
    }

    // Guardar el checklist si se proporcionó
    if (checklist && checklist.length > 0) {
      // Obtener la reparación para el checklist
      const reparacionActual = await prisma.reparaciones.findFirst({
        where: { ticket_id: ticketId }
      });

      if (reparacionActual) {
        // Crear o actualizar el checklist de reparación
        const checklistReparacion = await prisma.checklist_reparacion.upsert({
          where: {
            reparacion_id: reparacionActual.id
          },
          create: {
            reparacion_id: reparacionActual.id,
            updated_at: new Date()
          },
          update: {
            updated_at: new Date()
          }
        });

        // Eliminar respuestas existentes
        await prisma.checklist_respuesta_reparacion.deleteMany({
          where: {
            checklist_reparacion_id: checklistReparacion.id
          }
        });

        // Crear nuevas respuestas
        await Promise.all(
          checklist.map((item: any) =>
            prisma.checklist_respuesta_reparacion.create({
              data: {
                checklist_reparacion_id: checklistReparacion.id,
                checklist_item_id: item.itemId,
                respuesta: item.respuesta,
                observaciones: item.observacion || null,
                updated_at: new Date()
              }
            })
          )
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: completar ? 'Reparación completada y inventario actualizado' : 'Reparación actualizada'
    });

  } catch (error) {
    console.error('Error al guardar la reparación:', error);
    return NextResponse.json(
      { error: 'Error al guardar la reparación' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Verificar que el ticket exista y pertenezca al punto de reparación
    const ticket = await prisma.tickets.findFirst({
      where: {
        id: ticketId,
        punto_recoleccion_id: userPoint.punto_recoleccion_id
      },
      include: {
        reparaciones: {
          include: {
            checklist_reparacion: {
              include: {
                checklist_respuesta_reparacion: {
                  include: {
                    checklist_items: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reparacion: ticket.reparaciones
    });

  } catch (error) {
    console.error('Error al obtener la reparación:', error);
    return NextResponse.json(
      { error: 'Error al obtener la reparación' },
      { status: 500 }
    );
  }
} 