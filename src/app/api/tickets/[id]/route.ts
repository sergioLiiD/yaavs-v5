import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = params.id;

    // Primero consultamos directamente la tabla de clientes para ver qué datos tenemos
    const clienteQuery = `
      SELECT c.id, c.nombre, c."apellidoPaterno", c."apellidoMaterno"
      FROM "Cliente" c
      INNER JOIN tickets t ON t.cliente_id = c.id
      WHERE t.id = $1
    `;

    const clienteResult = await db.query(clienteQuery, [ticketId]);
    
    if (clienteResult.rows.length > 0) {
      console.log('DATOS DEL CLIENTE (CONSULTA DIRECTA):', JSON.stringify(clienteResult.rows[0], null, 2));
    }

    // Consulta para obtener información completa del ticket
    // Concatenamos directamente el nombre completo en la consulta SQL
    const query = `
      SELECT 
        t.*,
        c.id as cliente_id,
        c.nombre as cliente_nombre,
        c."apellidoPaterno" as cliente_apellido_paterno,
        c."apellidoMaterno" as cliente_apellido_materno,
        CONCAT(c.nombre, ' ', c."apellidoPaterno", ' ', COALESCE(c."apellidoMaterno", '')) as nombre_completo,
        tr.nombre as tipo_reparacion_nombre,
        u.id as tecnico_id,
        u.nombre as tecnico_nombre
      FROM 
        tickets t
      LEFT JOIN 
        "Cliente" c ON t.cliente_id = c.id
      LEFT JOIN 
        tipos_reparacion tr ON t.tipo_reparacion_id = tr.id
      LEFT JOIN 
        usuarios u ON t.tecnico_id = u.id
      WHERE 
        t.id = $1
    `;

    const result = await db.query(query, [ticketId]);

    if (result.rows.length === 0) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    const ticket = result.rows[0];
    
    console.log('Datos del cliente en el resultado del ticket:');
    console.log({
      cliente_id: ticket.cliente_id,
      cliente_nombre: ticket.cliente_nombre,
      cliente_apellido_paterno: ticket.cliente_apellido_paterno,
      cliente_apellido_materno: ticket.cliente_apellido_materno,
      nombre_completo: ticket.nombre_completo
    });
    
    // También hacemos una consulta adicional para verificar todos los clientes
    const todosClientesQuery = `
      SELECT id, nombre, "apellidoPaterno", "apellidoMaterno" 
      FROM "Cliente" 
      LIMIT 5
    `;
    
    const todosClientesResult = await db.query(todosClientesQuery);
    console.log('MUESTRA DE 5 CLIENTES EN LA BASE DE DATOS:');
    todosClientesResult.rows.forEach((cliente, index) => {
      console.log(`Cliente ${index + 1}:`, JSON.stringify(cliente, null, 2));
    });
    
    // Construcción del nombre completo (importante para mostrar en dropdown)
    const nombreCompleto = ticket.nombre_completo ? ticket.nombre_completo.trim() : (
      `${ticket.cliente_nombre || ''} ${ticket.cliente_apellido_paterno || ''} ${ticket.cliente_apellido_materno || ''}`.trim()
    );
    
    // Formatear la respuesta usando el nombre_completo generado
    const formattedTicket = {
      id: ticket.id,
      cliente: {
        id: ticket.cliente_id,
        nombre: nombreCompleto, // Aquí usamos el nombre completo
        // Mantener apellidos vacío, ya no lo usamos porque incluimos todo en nombre
        apellidos: ''
      },
      tipoReparacion: ticket.tipo_reparacion_nombre,
      marca: ticket.marca,
      modelo: ticket.modelo,
      imei: ticket.imei,
      capacidad: ticket.capacidad,
      color: ticket.color,
      fechaCompra: ticket.fecha_compra,
      codigoDesbloqueo: ticket.codigo_desbloqueo,
      redCelular: ticket.red_celular,
      tecnico: {
        id: ticket.tecnico_id,
        nombre: ticket.tecnico_nombre
      },
      fechaEntrega: ticket.fecha_entrega,
      prioridad: ticket.prioridad,
      estado: ticket.estado
    };

    console.log('Ticket formateado para enviar:', {
      id: formattedTicket.id,
      cliente: formattedTicket.cliente
    });

    return NextResponse.json(formattedTicket);
  } catch (error) {
    console.error('Error al obtener el ticket:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 