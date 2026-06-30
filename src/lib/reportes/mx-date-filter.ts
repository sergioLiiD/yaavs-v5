import { Prisma } from '@prisma/client';
import { APP_TIMEZONE } from '@/lib/datetime';

function normDate(d: string): string {
  return d.split('T')[0];
}

/**
 * Fecha calendario en Ciudad de México.
 * Los timestamps en BD (Prisma + PostgreSQL) se guardan como UTC en columnas `timestamp without time zone`.
 * timezone('UTC', col) fuerza esa interpretación aunque la sesión PG use America/Mexico_City.
 */
/** Rango inclusive de fechas calendario YYYY-MM-DD en Ciudad de México. */
export function sqlMxDateBetween(column: string, fechaInicio: string, fechaFin: string): Prisma.Sql {
  const start = normDate(fechaInicio);
  const end = normDate(fechaFin);
  const col = Prisma.raw(column);
  return Prisma.sql`
    DATE(timezone(${APP_TIMEZONE}, timezone('UTC', ${col}))) >= ${start}::date
    AND DATE(timezone(${APP_TIMEZONE}, timezone('UTC', ${col}))) <= ${end}::date
  `;
}
