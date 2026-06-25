import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { procesarDescuentoInventario, convertirConceptosAPiezas } from '@/lib/inventory-utils';
import {
  assertWorkflowAllowed,
  calcularSaldo,
  handleWorkflowError,
  loadTicketWorkflowContext,
} from '@/lib/ticket-workflow';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Validar permisos: ADMINISTRADOR o TICKETS_EDIT
    const userRole = session.user.role;
    const userPermissions = session.user.permissions || [];
    
    if (userRole !== 'ADMINISTRADOR' && !userPermissions.includes('TICKETS_EDIT')) {
      return NextResponse.json(
        { message: 'No tienes permisos para entregar equipos' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    const { firma, razonExcepcion } = await request.json();

    // La firma ya no es requerida, se hará físicamente después de imprimir

    // Obtener el ticket con toda la información necesaria
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        estatus_reparacion: true,
        presupuestos: true,
        pagos: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket no encontrado' }, { status: 404 });
    }

    // Verificar que el ticket esté reparado
    if (ticket.estatus_reparacion?.nombre !== 'Reparado') {
      return NextResponse.json({ 
        message: 'El ticket debe estar en estado "Reparado" para poder entregarlo' 
      }, { status: 400 });
    }

    // Verificar que ya esté entregado
    if (ticket.entregado) {
      return NextResponse.json({ 
        message: 'El equipo ya fue entregado' 
      }, { status: 400 });
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const ticketWorkflow = await loadTicketWorkflowContext(ticketId);
    if (!ticketWorkflow) {
      return NextResponse.json({ message: 'Ticket no encontrado' }, { status: 404 });
    }

    try {
      await assertWorkflowAllowed({
        ticket: ticketWorkflow,
        action: 'ENTREGA',
        userRole: userRole,
        usuarioId: usuario.id,
        razonExcepcion,
        metadata: { saldoPendiente: calcularSaldo(ticketWorkflow) },
      });
    } catch (error) {
      const handled = handleWorkflowError(error);
      if (handled) {
        return NextResponse.json(
          { message: handled.body.error, ...handled.body },
          { status: handled.status }
        );
      }
      throw error;
    }

    const totalPresupuesto = ticket.presupuestos?.total || 0;
    const totalPagos = ticket.pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const saldo = totalPresupuesto - totalPagos;

    // ============================================
    // GARANTIZAR DESCUENTO DE INVENTARIO
    // ============================================
    console.log('🔄 [ENTREGA] Iniciando proceso de descuento de inventario para ticket:', ticketId);
    
    // PASO 0: Verificar si ya existen salidas de inventario para este ticket
    console.log(`🔍 [ENTREGA] Verificando si ya existen salidas de inventario para Ticket-${ticketId}...`);
    const salidasExistentes = await prisma.salidas_almacen.findMany({
      where: {
        referencia: `Ticket-${ticketId}`,
        tipo: 'REPARACION'
      }
    });

    console.log(`📊 [ENTREGA] Salidas de inventario existentes: ${salidasExistentes.length}`);
    
    if (salidasExistentes.length > 0) {
      console.log('📦 [ENTREGA] Productos ya descontados:');
      salidasExistentes.forEach(salida => {
        console.log(`  - Producto ID: ${salida.producto_id}, Cantidad: ${salida.cantidad}, Fecha: ${salida.fecha}`);
      });
    }
    
    // Verificar si el ticket ya estaba en estado "Reparado"
    const yaEstabaReparado = ticket.estatus_reparacion?.nombre === 'Reparado';
    console.log(`🔍 [ENTREGA] Ticket ya estaba en estado "Reparado": ${yaEstabaReparado}`);
    
    // Si ya tiene salidas O ya estaba reparado, considerar que el inventario ya fue procesado
    const inventarioYaDescontado = salidasExistentes.length > 0 || yaEstabaReparado;
    
    if (inventarioYaDescontado) {
      if (salidasExistentes.length > 0) {
        console.log('✅ [ENTREGA] El inventario ya fue descontado (hay salidas registradas), omitiendo descuento...');
      } else {
        console.log('✅ [ENTREGA] El ticket ya estaba "Reparado" (inventario ya procesado), omitiendo descuento...');
      }
    } else {
      console.log('⚠️  [ENTREGA] No hay salidas previas y ticket no estaba reparado, se procederá a descontar inventario...');
    }
    
    try {
      if (!inventarioYaDescontado) {
        // PASO 1: Verificar/crear reparación
        console.log('🔍 [ENTREGA] Verificando si existe reparación...');
        let reparacion = await prisma.reparaciones.findFirst({
          where: { ticket_id: ticketId }
        });

        if (!reparacion) {
          console.log('⚠️  [ENTREGA] No existe reparación, creándola...');
          reparacion = await prisma.reparaciones.create({
            data: {
              ticket_id: ticketId,
              observaciones: 'Reparación creada automáticamente en entrega',
              fecha_inicio: new Date(),
              fecha_fin: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log('✅ [ENTREGA] Reparación creada:', reparacion.id);
        } else {
          console.log('✅ [ENTREGA] Reparación ya existe:', reparacion.id);
        }

        // PASO 2: Verificar si hay piezas de reparación
        console.log('🔍 [ENTREGA] Verificando si existen piezas de reparación...');
        const piezasExistentes = await prisma.piezas_reparacion_productos.count({
          where: { reparacion_id: reparacion.id }
        });

        console.log(`📊 [ENTREGA] Piezas encontradas en tabla nueva: ${piezasExistentes}`);

        // Si no hay piezas en tabla nueva, verificar tabla antigua
        let piezasAntiguasCount = 0;
        if (piezasExistentes === 0) {
          piezasAntiguasCount = await prisma.piezas_reparacion.count({
            where: { reparacion_id: reparacion.id }
          });
          console.log(`📊 [ENTREGA] Piezas encontradas en tabla antigua: ${piezasAntiguasCount}`);
        }

        // PASO 3: Si no hay piezas, convertir conceptos del presupuesto
        if (piezasExistentes === 0 && piezasAntiguasCount === 0) {
          console.log('⚠️  [ENTREGA] No hay piezas registradas, convirtiendo conceptos del presupuesto...');
          try {
            await convertirConceptosAPiezas(ticketId, reparacion.id);
            console.log('✅ [ENTREGA] Conceptos convertidos a piezas exitosamente');
          } catch (conversionError) {
            console.error('❌ [ENTREGA] Error al convertir conceptos:', conversionError);
            // Continuar - puede que el presupuesto no tenga productos físicos
            console.log('⚠️  [ENTREGA] Continuando sin conversión de conceptos (puede ser solo servicios)');
          }
        } else {
          console.log('✅ [ENTREGA] Ya existen piezas de reparación registradas');
        }

        // PASO 4: Procesar descuento de inventario
        console.log('🔄 [ENTREGA] Procesando descuento de inventario...');
        const resultadoDescuento = await procesarDescuentoInventario(ticketId, usuario.id);
        console.log('✅ [ENTREGA] Descuento procesado:', resultadoDescuento);
        
        if (resultadoDescuento.salidas.length === 0) {
          console.log('⚠️  [ENTREGA] No se descontaron productos (puede ser solo servicios o sin piezas físicas)');
        } else {
          console.log(`✅ [ENTREGA] Se descontaron ${resultadoDescuento.salidas.length} productos del inventario`);
        }
      }

    } catch (error) {
      console.error('❌ [ENTREGA] Error al procesar descuento de inventario:', error);
      
      // Si el inventario ya fue descontado, continuar con la entrega
      if (inventarioYaDescontado) {
        console.log('⚠️  [ENTREGA] Error en descuento pero inventario ya fue descontado previamente, continuando...');
      } else {
        // Si falla el descuento de inventario y NO había sido descontado antes, no entregar el equipo
        return NextResponse.json({ 
          message: `Error al procesar el descuento de inventario: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, revise el inventario y los productos del presupuesto.` 
        }, { status: 500 });
      }
    }

    // Buscar el estado "Entregado"
    console.log('🔍 [ENTREGA] Buscando estado "Entregado"...');
    const estatusEntregado = await prisma.estatus_reparacion.findFirst({
      where: { nombre: 'Entregado' }
    });

    if (!estatusEntregado) {
      console.error('❌ [ENTREGA] No se encontró el estado "Entregado"');
      return NextResponse.json({ 
        message: 'No se encontró el estado "Entregado" en la base de datos' 
      }, { status: 500 });
    }

    console.log('✅ [ENTREGA] Estado "Entregado" encontrado, ID:', estatusEntregado.id);

    // Actualizar el ticket como entregado
    console.log('🔄 [ENTREGA] Actualizando ticket a estado "Entregado"...');
    const ticketActualizado = await prisma.tickets.update({
      where: { id: ticketId },
      data: {
        entregado: true,
        fecha_entrega: new Date(),
        estatus_reparacion_id: estatusEntregado.id,
        updated_at: new Date()
      },
      include: {
        clientes: true,
        modelos: {
          include: {
            marcas: true
          }
        },
        estatus_reparacion: true
      }
    });

    console.log('✅ [ENTREGA] Ticket actualizado exitosamente:', {
      id: ticketActualizado.id,
      numero_ticket: ticketActualizado.numero_ticket,
      entregado: ticketActualizado.entregado,
      estado_id: ticketActualizado.estatus_reparacion_id,
      estado_nombre: ticketActualizado.estatus_reparacion?.nombre
    });

    return NextResponse.json({
      message: 'Equipo entregado exitosamente',
      ticket: ticketActualizado
    });

  } catch (error) {
    console.error('Error al entregar equipo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
