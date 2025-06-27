import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { verifyToken } from '@/lib/jwt';
import { ClienteService } from '@/services/clienteService';
import prisma from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación del cliente
    const cookieStore = cookies();
    const token = cookieStore.get('cliente_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const cliente = await ClienteService.findById(decoded.id);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const body = await req.json();
    console.log('Datos recibidos:', body);
    console.log('Datos de desbloqueo:', {
      tipoDesbloqueo: body.tipoDesbloqueo,
      codigoDesbloqueo: body.codigoDesbloqueo,
      patronDesbloqueo: body.patronDesbloqueo
    });

    // Validar datos requeridos
    if (!body.modeloId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar datos de desbloqueo
    if (body.tipoDesbloqueo === 'pin' && !body.codigoDesbloqueo) {
      console.log('Error: PIN requerido pero no proporcionado');
      return NextResponse.json(
        { error: 'El código de desbloqueo es requerido cuando el tipo es PIN' },
        { status: 400 }
      );
    }

    if (body.tipoDesbloqueo === 'patron' && (!body.patronDesbloqueo || body.patronDesbloqueo.length === 0)) {
      console.log('Error: Patrón requerido pero no proporcionado');
      return NextResponse.json(
        { error: 'El patrón de desbloqueo es requerido cuando el tipo es patrón' },
        { status: 400 }
      );
    }

    // Obtener el estado inicial (RECIBIDO)
    const estadoInicial = await prisma.estatus_reparacion.findFirst({
      where: {
        nombre: 'Recibido'
      }
    });

    if (!estadoInicial) {
      console.error('No se encontró el estado Recibido');
      return NextResponse.json(
        { error: 'Error al obtener el estado inicial' },
        { status: 500 }
      );
    }

    console.log('Estado inicial encontrado:', estadoInicial);

    // Obtener el modelo para obtener la marca
    const modelo = await prisma.modelos.findUnique({
      where: { id: Number(body.modeloId) },
      include: { marcas: true }
    });

    if (!modelo) {
      return NextResponse.json(
        { error: 'Modelo no encontrado' },
        { status: 404 }
      );
    }

    // Buscar un usuario administrador para usar como creador
    const usuarioCreador = await prisma.usuarios.findFirst({
      where: {
        usuarios_roles: {
          some: {
            roles: {
              nombre: 'ADMINISTRADOR'
            }
          }
        }
      }
    });

    if (!usuarioCreador) {
      return NextResponse.json(
        { error: 'No se encontró un usuario administrador para crear el ticket' },
        { status: 500 }
      );
    }

    // Crear el ticket
    const ticket = await prisma.tickets.create({
      data: {
        numero_ticket: `TKT-${Date.now()}`,
        cliente_id: cliente.id,
        tipo_servicio_id: 1, // Servicio de reparación
        modelo_id: Number(body.modeloId),
        descripcion_problema: body.descripcionProblema,
        estatus_reparacion_id: estadoInicial.id, // Usar el ID del estado Recibido
        creador_id: usuarioCreador.id,
        capacidad: body.capacidad,
        color: body.color,
        fecha_compra: body.fechaCompra ? new Date(body.fechaCompra) : null,
        tipo_desbloqueo: body.tipoDesbloqueo,
        codigo_desbloqueo: body.tipoDesbloqueo === 'pin' ? body.codigoDesbloqueo : null,
        patron_desbloqueo: body.tipoDesbloqueo === 'patron' ? body.patronDesbloqueo : [],
        red_celular: body.redCelular,
        updated_at: new Date(),
        dispositivos: {
          create: {
            tipo: 'Smartphone',
            marca: modelo.marcas?.nombre || 'Apple',
            modelo: modelo.nombre || 'iPhone 16 Pro',
            updated_at: new Date()
          }
        }
      }
    });

    console.log('Ticket creado:', ticket);

    // Crear la dirección solo si el tipo de recolección es domicilio
    if (body.tipoRecoleccion === 'domicilio' && body.direccion) {
      await prisma.direcciones.create({
        data: {
          calle: body.direccion.calle,
          numero_exterior: body.direccion.numeroExterior,
          numero_interior: body.direccion.numeroInterior,
          colonia: body.direccion.colonia,
          ciudad: body.direccion.ciudad,
          estado: body.direccion.estado,
          codigo_postal: body.direccion.codigoPostal,
          latitud: body.direccion.latitud,
          longitud: body.direccion.longitud,
          cliente_id: cliente.id,
          updated_at: new Date()
        }
      });
    }

    // Obtener el ticket completo con sus relaciones
    const ticketCompleto = await prisma.tickets.findUnique({
      where: { id: ticket.id },
      include: {
        dispositivos: true,
        clientes: true,
        modelos: {
          include: {
            marcas: true
          }
        },
        estatus_reparacion: true
      }
    });

    // Mapear los datos a formato camelCase para el frontend
    const ticketMapeado = {
      ...ticketCompleto,
      numeroTicket: ticketCompleto?.numero_ticket,
      clienteId: ticketCompleto?.cliente_id,
      tipoServicioId: ticketCompleto?.tipo_servicio_id,
      modeloId: ticketCompleto?.modelo_id,
      descripcionProblema: ticketCompleto?.descripcion_problema,
      estatusReparacionId: ticketCompleto?.estatus_reparacion_id,
      creadorId: ticketCompleto?.creador_id,
      fechaCompra: ticketCompleto?.fecha_compra,
      tipoDesbloqueo: ticketCompleto?.tipo_desbloqueo,
      codigoDesbloqueo: ticketCompleto?.codigo_desbloqueo,
      patronDesbloqueo: ticketCompleto?.patron_desbloqueo,
      redCelular: ticketCompleto?.red_celular,
      createdAt: ticketCompleto?.created_at,
      updatedAt: ticketCompleto?.updated_at,
      dispositivo: ticketCompleto?.dispositivos,
      direccion: null,
      cliente: ticketCompleto?.clientes,
      modelo: ticketCompleto?.modelos ? {
        ...ticketCompleto.modelos,
        marcaId: ticketCompleto.modelos.marca_id,
        createdAt: ticketCompleto.modelos.created_at,
        updatedAt: ticketCompleto.modelos.updated_at,
        marca: ticketCompleto.modelos.marcas
      } : null,
      estatusReparacion: ticketCompleto?.estatus_reparacion
    };

    return NextResponse.json(ticketMapeado);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: `Error al crear ticket: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación del cliente
    const cookieStore = cookies();
    const token = cookieStore.get('cliente_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const cliente = await ClienteService.findById(decoded.id);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener los tickets del cliente
    const tickets = await prisma.tickets.findMany({
      where: {
        cliente_id: cliente.id
      },
      include: {
        tipos_servicio: true,
        modelos: {
          include: {
            marcas: true,
          },
        },
        estatus_reparacion: true,
        usuarios_tickets_tecnico_asignado_idTousuarios: true,
        presupuestos: true,
        reparaciones: true,
        dispositivos: true,
        pagos: {
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
} 