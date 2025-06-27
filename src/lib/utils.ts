import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch (error) {
    return 'Fecha no disponible';
  }
} 