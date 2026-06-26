export const NUMERO_TICKET_REGEX = /^TICK-\d+$/;

export function normalizeNumeroTicket(value: string): string {
  const trimmed = value.trim().toUpperCase();
  if (NUMERO_TICKET_REGEX.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 10) return `TICK-${digits}`;
  throw new Error('El número de ticket debe tener el formato TICK- seguido de dígitos');
}

/** El número TICK-{timestamp} suele coincidir con la fecha de recepción original */
export function inferFechaRecepcionFromNumeroTicket(numeroTicket: string): Date | null {
  const match = numeroTicket.match(/^TICK-(\d{10,})$/);
  if (!match) return null;
  const ts = Number(match[1]);
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  if (year < 2020 || year > 2035) return null;
  return date;
}

export function resolveEstatusRecuperado(entregado: boolean, saldo: number) {
  if (entregado) return 'Entregado';
  if (saldo > 0) return 'En Reparación';
  return 'Reparado';
}
