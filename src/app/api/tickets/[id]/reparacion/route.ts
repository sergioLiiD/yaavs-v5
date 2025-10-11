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
    console.log('🔄 Iniciando endpoint de actualización de reparación (Sistema Central)...');
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);
    const ticketId = parseInt(params.id);
    console.log('ID del ticket:', ticketId);

    if (isNaN(ticketId)) {
      console.log('ID de ticket inválido');
      return NextResponse.json({ error: 'ID de ticket inválido' }, { status: 400 });
    }

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: { usuarios_tickets_tecnico_asignado_idTousuarios: true }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    console.log('Ticket encontrado:', ticket);

    const body = await request.json();
    console.log('📋 Datos recibidos:', JSON.stringify(body, null, 2));
    const { observaciones, checklist, fotos, videos, completar } = body;

    console.log('🔍 Parámetros extraídos:', {
      observaciones,
      checklistLength: checklist?.length,
      fotosLength: fotos?.length,
      videosLength: videos?.length,
      completar
    });

    // Si se está completando la reparación, validar stock primero
    if (completar) {
      console.log('🔍 Validando stock para ticket:', ticketId);
      try {
        const validacionStock = await validarStockReparacion(ticketId);
        console.log('📊 Resultado de validación:', JSON.stringify(validacionStock, null, 2));
        
        if (!validacionStock.success) {
          console.log('❌ Validación de stock falló:', validacionStock.errors);
          return NextResponse.json(
            { 
              error: 'No se puede completar la reparación por falta de stock',
              detalles: validacionStock.errors,
              stockFaltante: validacionStock.missingStock
            },
            { status: 400 }
          );
        }
        console.log('✅ Validación de stock exitosa');
      } catch (validacionError) {
        console.error('❌ Error durante validación de stock:', validacionError);
        return NextResponse.json(
          { 
            error: 'Error al validar stock',
            mensaje: validacionError instanceof Error ? validacionError.message : 'Error desconocido'
          },
          { status: 400 }
        );
      }
    }

    // Procesar en transacción si se está completando
    if (completar) {
      console.log('🔄 Iniciando transacción para completar reparación (Sistema Central)...');
      
      try {
        await prisma.$transaction(async (tx) => {
          // Crear o actualizar la reparación
          console.log('📝 Creando/actualizando reparación...');
          const reparacion = await tx.reparaciones.upsert({
            where: { ticket_id: ticketId },
            update: {
              observaciones,
              fecha_fin: new Date(),
              diagnostico: body.diagnostico,
              salud_bateria: body.saludBateria,
              version_so: body.versionSO,
              updated_at: new Date()
            },
            create: {
              ticket_id: ticketId,
              observaciones,
              fecha_inicio: new Date(),
              fecha_fin: new Date(),
              diagnostico: body.diagnostico,
              salud_bateria: body.saludBateria,
              version_so: body.versionSO,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log('✅ Reparación creada/actualizada:', reparacion.id);

          // Actualizar el estado del ticket
          console.log('📝 Actualizando estado del ticket...');
          const estatusReparado = await tx.estatus_reparacion.findFirst({
            where: { nombre: 'Reparado' }
          });

          if (!estatusReparado) {
            throw new Error('No se encontró el estatus "Reparado"');
          }

          await tx.tickets.update({
            where: { id: ticketId },
            data: {
              estatus_reparacion_id: estatusReparado.id,
              fecha_fin_reparacion: new Date(),
              updated_at: new Date()
            }
          });
          console.log('✅ Estado del ticket actualizado a: Reparado');

          // Convertir conceptos del presupuesto a piezas de reparación
          console.log('🔄 Convirtiendo conceptos del presupuesto...');
          try {
            await convertirConceptosAPiezas(ticketId, reparacion.id);
            console.log('✅ Conceptos convertidos exitosamente');
          } catch (error) {
            console.error('❌ Error al convertir conceptos:', error);
            // No lanzar error, solo logear para no fallar todo el proceso
          }

          // Procesar descuento de inventario
          console.log('🔄 Iniciando procesamiento de descuento de inventario para ticket:', ticketId);
          try {
            await procesarDescuentoInventario(ticketId, Number(session.user.id));
            console.log('✅ Descuento de inventario procesado exitosamente');
          } catch (error) {
            console.error('❌ Error al procesar descuento de inventario:', error);
            // No lanzar error, solo logear para no fallar todo el proceso
          }
        });
        console.log('✅ Transacción completada exitosamente (Sistema Central)');
      } catch (error) {
        console.error('❌ Error en la transacción:', error);
        throw error;
      }
    } else {
      // Solo actualizar observaciones si no se está completando
      console.log('📝 Actualizando reparación sin completar...');
      const reparacion = await prisma.reparaciones.upsert({
        where: { ticket_id: ticketId },
        update: {
          observaciones,
          diagnostico: body.diagnostico,
          salud_bateria: body.saludBateria,
          version_so: body.versionSO,
          updated_at: new Date()
        },
        create: {
          ticket_id: ticketId,
          observaciones,
          fecha_inicio: new Date(),
          diagnostico: body.diagnostico,
          salud_bateria: body.saludBateria,
          version_so: body.versionSO,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Reparación actualizada sin completar:', reparacion.id);
    }

    // Guardar las respuestas del checklist
    if (checklist && Array.isArray(checklist)) {
      try {
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
              created_at: new Date(),
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
          for (const item of checklist) {
            await prisma.checklist_respuesta_reparacion.create({
              data: {
                checklist_reparacion_id: checklistReparacion.id,
                checklist_item_id: item.itemId,
                respuesta: item.respuesta,
                observaciones: item.observacion || null,
                created_at: new Date(),
                updated_at: new Date()
              }
            });
          }

          console.log('✅ Checklist guardado exitosamente:', checklist.length, 'items');
        }
      } catch (error) {
        console.error('❌ Error al guardar el checklist (no crítico):', error);
        // No lanzar error, solo logear para no fallar todo el proceso
      }
    }

    return NextResponse.json({
      success: true,
      message: completar ? 'Reparación completada y inventario actualizado (Sistema Central)' : 'Reparación actualizada (Sistema Central)'
    });
  } catch (error) {
    console.error('❌ Error al actualizar la reparación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 