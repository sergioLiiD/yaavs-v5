import { Prisma } from '@prisma/client';
import { APP_TIMEZONE } from '@/lib/datetime';

function normDate(d: string): string {
  return d.split('T')[0];
}

/**
 * Fecha calendario en Ciudad de México para un timestamp guardado en UTC (Prisma/PostgreSQL).
 * Usar en $queryRaw para filtrar por "día de negocio" en México.
 */
export function sqlMxCalendarDateFromUtc(column: string): Prisma.Sql {
  return Prisma.sql`(${Prisma.raw(column)} AT TIME ZONE 'UTC' AT TIME ZONE ${APP_TIMEZONE})::date`;
}

/** Rango inclusive de fechas calendario YYYY-MM-DD en Ciudad de México. */
export function sqlMxDateBetween(column: string, fechaInicio: string, fechaFin: string): Prisma.Sql {
  const start = normDate(fechaInicio);
  const end = normDate(fechaFin);
  return Prisma.sql`
    ${sqlMxCalendarDateFromUtc(column)} >= ${start}::date
    AND ${sqlMxCalendarDateFromUtc(column)} <= ${end}::date
  `;
}
