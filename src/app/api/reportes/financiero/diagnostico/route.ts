import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTodayDateMX, parseDateRangeMX } from '@/lib/datetime';
import { sqlMxDateBetween } from '@/lib/reportes/mx-date-filter';
import { sumPagosReparacionMX } from '@/lib/reportes/financiero-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const fechaInicio = body.fechaInicio ?? getTodayDateMX();
    const fechaFin = body.fechaFin ?? fechaInicio;

    const { fechaInicioDate, fechaFinDate } = parseDateRangeMX(fechaInicio, fechaFin);

    const [pgTz, pagosRecientes, pagosRangoUtc, pagosRangoMx, totalMx] = await Promise.all([
      prisma.$queryRaw<Array<{ tz: string }>>`SHOW timezone`,
      prisma.$queryRaw<
        Array<{
          id: number;
          monto: number;
          created_at: Date;
          fecha_naive: string;
          fecha_mx_utc: string;
        }>
      >`
        SELECT
          id,
          monto,
          created_at,
          created_at::date::text AS fecha_naive,
          DATE(timezone('America/Mexico_City', timezone('UTC', created_at)))::text AS fecha_mx_utc
        FROM pagos
        WHERE estado = 'ACTIVO' AND ticket_id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 15
      `,
      prisma.$queryRaw<Array<{ count: bigint; total: number | null }>>`
        SELECT COUNT(*)::bigint AS count, COALESCE(SUM(monto), 0)::float AS total
        FROM pagos
        WHERE created_at >= ${fechaInicioDate} AND created_at <= ${fechaFinDate}
          AND estado = 'ACTIVO' AND ticket_id IS NOT NULL
      `,
      prisma.$queryRaw<Array<{ count: bigint; total: number | null }>>`
        SELECT COUNT(*)::bigint AS count, COALESCE(SUM(monto), 0)::float AS total
        FROM pagos
        WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
          AND estado = 'ACTIVO' AND ticket_id IS NOT NULL
      `,
      sumPagosReparacionMX(fechaInicio, fechaFin),
    ]);

    const pagosDelDia = pagosRecientes.filter((p) => p.fecha_mx_utc === fechaInicio);

    return NextResponse.json({
      hoyServidorMX: getTodayDateMX(),
      filtrosRecibidos: { fechaInicio, fechaFin },
      rangoUtcParseDateRangeMX: {
        inicio: fechaInicioDate.toISOString(),
        fin: fechaFinDate.toISOString(),
      },
      postgresTimezone: pgTz[0]?.tz ?? null,
      pagosReparacion: {
        filtroUtcPrisma: {
          count: Number(pagosRangoUtc[0]?.count ?? 0),
          total: pagosRangoUtc[0]?.total ?? 0,
        },
        filtroFechaCalendarioMX: {
          count: Number(pagosRangoMx[0]?.count ?? 0),
          total: totalMx,
        },
      },
      pagosRecientes,
      pagosConFechaMxIgualAFiltro: pagosDelDia,
    });
  } catch (error) {
    console.error('Error en diagnóstico financiero:', error);
    return NextResponse.json(
      { error: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}
