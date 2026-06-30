import { prisma } from '@/lib/prisma';
import { sqlMxDateBetween } from '@/lib/reportes/mx-date-filter';

export async function sumVentasProductosMX(fechaInicio: string, fechaFin: string): Promise<number> {
  const [row] = await prisma.$queryRaw<Array<{ total: number | null }>>`
    SELECT COALESCE(SUM(total), 0)::float AS total
    FROM ventas
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'COMPLETADA'
  `;
  return row?.total ?? 0;
}

export async function sumPagosReparacionMX(fechaInicio: string, fechaFin: string): Promise<number> {
  const [row] = await prisma.$queryRaw<Array<{ total: number | null }>>`
    SELECT COALESCE(SUM(monto), 0)::float AS total
    FROM pagos
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'ACTIVO'
      AND ticket_id IS NOT NULL
  `;
  return row?.total ?? 0;
}

export async function countVentasMX(fechaInicio: string, fechaFin: string): Promise<number> {
  const [row] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM ventas
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'COMPLETADA'
  `;
  return Number(row?.count ?? 0);
}

export async function countTicketsConPagosMX(fechaInicio: string, fechaFin: string): Promise<number> {
  const [row] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(DISTINCT ticket_id)::bigint AS count
    FROM pagos
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'ACTIVO'
      AND ticket_id IS NOT NULL
  `;
  return Number(row?.count ?? 0);
}

export async function sumComprasInsumosMX(fechaInicio: string, fechaFin: string): Promise<number> {
  const [row] = await prisma.$queryRaw<Array<{ total: number | null }>>`
    SELECT COALESCE(SUM(precio_compra * cantidad), 0)::float AS total
    FROM entradas_almacen
    WHERE ${sqlMxDateBetween('fecha', fechaInicio, fechaFin)}
  `;
  return row?.total ?? 0;
}

export async function pagosIdsReparacionEnRangoMX(
  fechaInicio: string,
  fechaFin: string
): Promise<number[]> {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM pagos
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'ACTIVO'
      AND ticket_id IS NOT NULL
  `;
  return rows.map((r) => r.id);
}

export async function ventasIdsEnRangoMX(fechaInicio: string, fechaFin: string): Promise<number[]> {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM ventas
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'COMPLETADA'
  `;
  return rows.map((r) => r.id);
}

export async function pagosIdsEnRangoMX(fechaInicio: string, fechaFin: string): Promise<number[]> {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM pagos
    WHERE ${sqlMxDateBetween('created_at', fechaInicio, fechaFin)}
      AND estado = 'ACTIVO'
  `;
  return rows.map((r) => r.id);
}

export async function entradasIdsEnRangoMX(fechaInicio: string, fechaFin: string): Promise<number[]> {
  const rows = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM entradas_almacen
    WHERE ${sqlMxDateBetween('fecha', fechaInicio, fechaFin)}
  `;
  return rows.map((r) => r.id);
}
