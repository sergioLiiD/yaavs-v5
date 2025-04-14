import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await req.json();
    const {
      clienteId,
      tipoReparacionId,
      marca,
      modelo,
      imei,
      capacidad,
      color,
      fechaCompra,
      tipoDesbloqueo,
      codigoDesbloqueo,
      patronDesbloqueo,
      redCelular,
      tecnicoId,
      fechaEntrega,
      prioridad,
      estado,
      checklistRecepcion,
      checklistPostReparacion
    } = body;

    // Iniciar transacción
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Insertar ticket
      const ticketResult = await client.query(
        `INSERT INTO "Ticket" (
          "clienteId", "tipoServicioId", marca, modelo, imei, capacidad, color,
          fecha_compra, tipo_desbloqueo, codigo_desbloqueo, patron_desbloqueo,
          red_celular, "tecnicoId", "fechaEntrega", prioridad, estado,
          "creadorId", "actualizadoPor"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id`,
        [
          clienteId, tipoReparacionId, marca, modelo, imei, capacidad, color,
          fechaCompra, tipoDesbloqueo, codigoDesbloqueo, patronDesbloqueo,
          redCelular, tecnicoId, fechaEntrega, prioridad, estado,
          session.user.id, session.user.id
        ]
      );

      const ticketId = ticketResult.rows[0].id;

      // Insertar checklist de recepción
      if (checklistRecepcion) {
        await client.query(
          `INSERT INTO "ChecklistRecepcion" (
            "ticketId", enciende, pantalla, boton_inicio, botones_volumen,
            camara, microfono, altavoz, wifi, bluetooth, gps,
            "creadoPor", "actualizadoPor"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            ticketId,
            checklistRecepcion.enciende,
            checklistRecepcion.pantalla,
            checklistRecepcion.botonInicio,
            checklistRecepcion.botonesVolumen,
            checklistRecepcion.camara,
            checklistRecepcion.microfono,
            checklistRecepcion.altavoz,
            checklistRecepcion.wifi,
            checklistRecepcion.bluetooth,
            checklistRecepcion.gps,
            session.user.id,
            session.user.id
          ]
        );
      }

      // Insertar checklist post-reparación
      if (checklistPostReparacion) {
        await client.query(
          `INSERT INTO "ChecklistPostReparacion" (
            "ticketId", enciende, pantalla, boton_inicio, botones_volumen,
            camara, microfono, altavoz, wifi, bluetooth, gps,
            "creadoPor", "actualizadoPor"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            ticketId,
            checklistPostReparacion.enciende,
            checklistPostReparacion.pantalla,
            checklistPostReparacion.botonInicio,
            checklistPostReparacion.botonesVolumen,
            checklistPostReparacion.camara,
            checklistPostReparacion.microfono,
            checklistPostReparacion.altavoz,
            checklistPostReparacion.wifi,
            checklistPostReparacion.bluetooth,
            checklistPostReparacion.gps,
            session.user.id,
            session.user.id
          ]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({ id: ticketId });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al crear el ticket:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado');

    console.log('Iniciando consulta de tickets...');
    const client = await db.connect();
    try {
      let query = `
        SELECT 
          t.id,
          t."numeroTicket",
          t."fechaRecepcion",
          t."fechaEntrega",
          t."createdAt",
          t."updatedAt",
          t."clienteId",
          t."tipoServicioId",
          t."modeloId",
          t."estatusReparacionId",
          t."tecnicoAsignadoId",
          t."descripcion",
          t."recogida",
          t."entregado",
          t."cancelado",
          t."motivoCancelacion",
          c.nombre as "nombreCliente",
          c."apellidoPaterno" as "apellidoPaternoCliente",
          c."apellidoMaterno" as "apellidoMaternoCliente",
          ts.nombre as "tipoReparacion",
          u.nombre as "nombreTecnico",
          u."apellidoPaterno" as "apellidoPaternoTecnico",
          u."apellidoMaterno" as "apellidoMaternoTecnico",
          m.nombre as "modelo",
          ma.nombre as "marca",
          er.nombre as "estatusReparacion"
        FROM "Ticket" t
        LEFT JOIN "Cliente" c ON t."clienteId" = c.id
        LEFT JOIN tipos_servicio ts ON t."tipoServicioId" = ts.id
        LEFT JOIN "Usuario" u ON t."tecnicoAsignadoId" = u.id
        LEFT JOIN modelos m ON t."modeloId" = m.id
        LEFT JOIN marcas ma ON m."marcaId" = ma.id
        LEFT JOIN "EstatusReparacion" er ON t."estatusReparacionId" = er.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (estado) {
        query += ` AND t.estado = $1`;
        params.push(estado);
      }

      console.log('Ejecutando consulta:', query);
      console.log('Parámetros:', params);

      const result = await client.query(query, params);
      console.log('Resultado de la consulta:', result.rows);
      
      return NextResponse.json(result.rows || []);
    } catch (error) {
      console.error('Error en la consulta SQL:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener los tickets:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 