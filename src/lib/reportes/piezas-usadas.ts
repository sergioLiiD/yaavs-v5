import { prisma } from '@/lib/prisma';
import { mesKeyMX, parseDateRangeMX } from '@/lib/datetime';

export interface FiltrosPiezasUsadas {
  fechaInicio: string;
  fechaFin: string;
}

export interface ResumenPieza {
  productoId: number;
  sku: string;
  nombre: string;
  marca: string | null;
  modelo: string | null;
  cantidadUsada: number;
  numTickets: number;
  ingresos: number;
  egresos: number;
  margen: number;
}

export interface ResumenPiezaPorMes {
  mes: string;
  mesLabel: string;
  piezas: ResumenPieza[];
  totalTickets: number;
  totalIngresos: number;
  totalEgresos: number;
}

export interface DetallePiezaTicket {
  ticketId: number;
  numeroTicket: string;
  fechaEntrega: string;
  productoId: number;
  sku: string;
  nombreProducto: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
  ingreso: number;
  egreso: number;
  margen: number;
}

export interface ReportePiezasUsadas {
  periodo: { fechaInicio: string; fechaFin: string };
  resumen: {
    totalTickets: number;
    totalPiezasDistintas: number;
    totalCantidadUsada: number;
    totalIngresos: number;
    totalEgresos: number;
    margen: number;
  };
  porPieza: ResumenPieza[];
  porMes: ResumenPiezaPorMes[];
  detalle: DetallePiezaTicket[];
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parseFechas(filtros: FiltrosPiezasUsadas) {
  return parseDateRangeMX(filtros.fechaInicio, filtros.fechaFin);
}

function mesKey(fecha: Date): string {
  return mesKeyMX(fecha);
}

function mesLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MESES[parseInt(month, 10) - 1]} ${year}`;
}

interface PiezaAcumulada {
  productoId: number;
  sku: string;
  nombre: string;
  marca: string | null;
  modelo: string | null;
  cantidadUsada: number;
  ticketIds: Set<number>;
  ingresos: number;
  egresos: number;
}

function crearAcumulador(
  productoId: number,
  sku: string,
  nombre: string,
  marca: string | null,
  modelo: string | null
): PiezaAcumulada {
  return {
    productoId,
    sku,
    nombre,
    marca,
    modelo,
    cantidadUsada: 0,
    ticketIds: new Set(),
    ingresos: 0,
    egresos: 0,
  };
}

function acumuladorAPieza(acum: PiezaAcumulada): ResumenPieza {
  return {
    productoId: acum.productoId,
    sku: acum.sku,
    nombre: acum.nombre,
    marca: acum.marca,
    modelo: acum.modelo,
    cantidadUsada: acum.cantidadUsada,
    numTickets: acum.ticketIds.size,
    ingresos: acum.ingresos,
    egresos: acum.egresos,
    margen: acum.ingresos - acum.egresos,
  };
}

export async function obtenerReportePiezasUsadas(
  filtros: FiltrosPiezasUsadas
): Promise<ReportePiezasUsadas> {
  const { fechaInicioDate, fechaFinDate } = parseFechas(filtros);

  const tickets = await prisma.tickets.findMany({
    where: {
      entregado: true,
      cancelado: false,
      fecha_entrega: {
        gte: fechaInicioDate,
        lte: fechaFinDate,
      },
    },
    include: {
      reparaciones: {
        include: {
          piezas_reparacion_productos: {
            include: {
              productos: {
                include: {
                  marcas: true,
                  modelos: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { fecha_entrega: 'asc' },
  });

  const globalMap = new Map<number, PiezaAcumulada>();
  const mesMap = new Map<string, Map<number, PiezaAcumulada>>();
  const mesTickets = new Map<string, Set<number>>();
  const detalle: DetallePiezaTicket[] = [];
  const ticketsConPiezas = new Set<number>();

  for (const ticket of tickets) {
    if (!ticket.fecha_entrega) continue;

    const reparacion = ticket.reparaciones;
    if (!reparacion?.piezas_reparacion_productos.length) continue;

    const keyMes = mesKey(ticket.fecha_entrega);
    if (!mesMap.has(keyMes)) {
      mesMap.set(keyMes, new Map());
      mesTickets.set(keyMes, new Set());
    }

    ticketsConPiezas.add(ticket.id);
    mesTickets.get(keyMes)!.add(ticket.id);

    for (const pieza of reparacion.piezas_reparacion_productos) {
      const producto = pieza.productos;
      if (!producto) continue;

      const ingreso = pieza.total ?? pieza.precio * pieza.cantidad;
      const egreso = pieza.cantidad * (producto.precio_promedio ?? 0);

      detalle.push({
        ticketId: ticket.id,
        numeroTicket: ticket.numero_ticket,
        fechaEntrega: ticket.fecha_entrega.toISOString(),
        productoId: producto.id,
        sku: producto.sku,
        nombreProducto: producto.nombre,
        marca: producto.marcas?.nombre ?? null,
        modelo: producto.modelos?.nombre ?? null,
        cantidad: pieza.cantidad,
        ingreso,
        egreso,
        margen: ingreso - egreso,
      });

      for (const map of [globalMap, mesMap.get(keyMes)!]) {
        if (!map.has(producto.id)) {
          map.set(
            producto.id,
            crearAcumulador(
              producto.id,
              producto.sku,
              producto.nombre,
              producto.marcas?.nombre ?? null,
              producto.modelos?.nombre ?? null
            )
          );
        }
        const acum = map.get(producto.id)!;
        acum.cantidadUsada += pieza.cantidad;
        acum.ticketIds.add(ticket.id);
        acum.ingresos += ingreso;
        acum.egresos += egreso;
      }
    }
  }

  const porPieza = Array.from(globalMap.values())
    .map(acumuladorAPieza)
    .sort((a, b) => b.ingresos - a.ingresos);

  const porMes = Array.from(mesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, map]) => {
      const piezas = Array.from(map.values())
        .map(acumuladorAPieza)
        .sort((a, b) => b.ingresos - a.ingresos);
      const totalIngresos = piezas.reduce((s, p) => s + p.ingresos, 0);
      const totalEgresos = piezas.reduce((s, p) => s + p.egresos, 0);
      return {
        mes,
        mesLabel: mesLabel(mes),
        piezas,
        totalTickets: mesTickets.get(mes)?.size ?? 0,
        totalIngresos,
        totalEgresos,
      };
    });

  const totalIngresos = porPieza.reduce((s, p) => s + p.ingresos, 0);
  const totalEgresos = porPieza.reduce((s, p) => s + p.egresos, 0);
  const totalCantidadUsada = porPieza.reduce((s, p) => s + p.cantidadUsada, 0);

  return {
    periodo: { fechaInicio: filtros.fechaInicio, fechaFin: filtros.fechaFin },
    resumen: {
      totalTickets: ticketsConPiezas.size,
      totalPiezasDistintas: porPieza.length,
      totalCantidadUsada,
      totalIngresos,
      totalEgresos,
      margen: totalIngresos - totalEgresos,
    },
    porPieza,
    porMes,
    detalle,
  };
}
