export const APP_TIMEZONE = 'America/Mexico_City';

type DateInput = Date | string;

function toDate(value: DateInput): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

function getPartsInTimeZone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Convierte una fecha/hora local en la zona indicada a un instante UTC. */
export function zonedTimeToUtc(
  localDateStr: string,
  localTimeStr: string,
  timeZone: string = APP_TIMEZONE
): Date {
  const [y, m, d] = localDateStr.split('-').map(Number);
  const timeParts = localTimeStr.replace(',', '.').split(':');
  const hh = parseInt(timeParts[0] ?? '0', 10);
  const mm = parseInt(timeParts[1] ?? '0', 10);
  const ssMs = (timeParts[2] ?? '0').split('.');
  const ss = parseInt(ssMs[0] ?? '0', 10);
  const ms = parseInt((ssMs[1] ?? '0').padEnd(3, '0').slice(0, 3), 10);

  let utc = Date.UTC(y, m - 1, d, hh, mm, ss, ms);

  for (let i = 0; i < 3; i++) {
    const p = getPartsInTimeZone(new Date(utc), timeZone);
    const desired = Date.UTC(y, m - 1, d, hh, mm, ss, ms);
    const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, ms);
    utc += desired - actual;
  }

  return new Date(utc);
}

function normalizeDateInput(dateInput: string): string {
  return dateInput.split('T')[0];
}

/** Inicio y fin de día en Ciudad de México como instantes UTC para consultas. */
export function parseDateRangeMX(fechaInicio: string, fechaFin: string) {
  const inicioStr = normalizeDateInput(fechaInicio);
  const finStr = normalizeDateInput(fechaFin);

  return {
    fechaInicioDate: zonedTimeToUtc(inicioStr, '00:00:00'),
    fechaFinDate: zonedTimeToUtc(finStr, '23:59:59.999'),
  };
}

/** Lista de días calendario (YYYY-MM-DD) entre dos fechas inclusive. */
export function eachCalendarDayMX(fechaInicio: string, fechaFin: string): string[] {
  const start = normalizeDateInput(fechaInicio);
  const end = normalizeDateInput(fechaFin);
  const days: string[] = [];

  let [y, m, d] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const endTime = Date.UTC(ey, em - 1, ed);

  while (true) {
    const current = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(current);

    const currentTime = Date.UTC(y, m - 1, d);
    if (currentTime >= endTime) break;

    const next = new Date(Date.UTC(y, m - 1, d + 1));
    y = next.getUTCFullYear();
    m = next.getUTCMonth() + 1;
    d = next.getUTCDate();
  }

  return days;
}

/** Desplaza una fecha YYYY-MM-DD N meses en calendario. */
export function shiftDateStringMonths(dateStr: string, months: number): string {
  const [y, m, d] = normalizeDateInput(dateStr).split('-').map(Number);
  const shifted = new Date(Date.UTC(y, m - 1 + months, d));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
}

export function getMexicoDateParts(date: DateInput) {
  return getPartsInTimeZone(toDate(date), APP_TIMEZONE);
}

/** Fecha calendario YYYY-MM-DD en Ciudad de México. */
export function getTodayDateMX(date: DateInput = new Date()): string {
  const { year, month, day } = getMexicoDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Suma días a una fecha YYYY-MM-DD en calendario. */
export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = normalizeDateInput(dateStr).split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`;
}

/** Día de la semana (0=domingo) en Ciudad de México para una fecha YYYY-MM-DD. */
export function getDayOfWeekMX(dateStr: string): number {
  const utc = zonedTimeToUtc(normalizeDateInput(dateStr), '12:00:00');
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
  }).format(utc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? 0;
}

/** Primer día del mes calendario en Ciudad de México. */
export function getMonthStartMX(dateStr: string): string {
  const [y, m] = normalizeDateInput(dateStr).split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

export function mesKeyMX(date: DateInput): string {
  const { year, month } = getMexicoDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}`;
}

function formatWithParts(
  date: DateInput,
  options: Intl.DateTimeFormatOptions
): string | null {
  const d = toDate(date);
  if (isNaN(d.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('es-MX', {
    timeZone: APP_TIMEZONE,
    ...options,
  });

  return formatter.format(d);
}

export function formatDateTimeMX(date: DateInput): string {
  const d = toDate(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';

  const parts = new Intl.DateTimeFormat('es-MX', {
    timeZone: APP_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
}

export function formatDateMX(date: DateInput): string {
  return formatWithParts(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) ?? 'Fecha inválida';
}

export function formatTimeMX(date: DateInput): string {
  return formatWithParts(date, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) ?? 'Hora inválida';
}

export function formatDateShortMX(date: DateInput): string {
  return formatWithParts(date, {
    month: 'short',
    day: 'numeric',
  }) ?? 'Fecha inválida';
}
