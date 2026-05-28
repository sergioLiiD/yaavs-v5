import axios from '@/lib/axios';

export interface FiltrosReporte {
  fechaInicio: string;
  fechaFin: string;
  tipoPeriodo: 'dia' | 'semana' | 'mes' | 'personalizado';
  clienteId?: number;
  proveedorId?: number;
  metodoPago?: string;
}

export interface ResumenFinanciero {
  ingresos: {
    ventasProductos: number;
    serviciosReparacion: number;
    total: number;
  };
  egresos: {
    comprasInsumos: number;
    total: number;
  };
  balance: number;
  totalTicketsEnPeriodo: number;
  costoPromedioTicket: number;
  comparativaMesAnterior: {
    ingresos: number;
    egresos: number;
    balance: number;
    porcentajeCambio: number;
  };
}

export interface DetalleIngreso {
  id: number;
  fecha: string;
  tipo: 'venta_producto' | 'servicio_reparacion';
  cliente: string;
  monto: number;
  metodoPago?: string;
  referencia?: string;
  detalles?: string[];
}

export interface DetalleEgreso {
  id: number;
  fecha: string;
  proveedor: string;
  monto: number;
  productos: string[];
  notas?: string;
}

export interface DatosGrafico {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface TransaccionCorteCaja {
  id: number;
  fecha: string;
  cliente: string;
  monto: number;
  metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA';
  numeroTicket: string;
  tipoTransaccion?: string;
  referencia?: string | null;
}

export interface CorteCaja {
  totales: {
    efectivo: number;
    transferencia: number;
    tarjeta: number;
    total: number;
  };
  transacciones: TransaccionCorteCaja[];
  transaccionesAgrupadas: {
    EFECTIVO: TransaccionCorteCaja[];
    TRANSFERENCIA: TransaccionCorteCaja[];
    TARJETA: TransaccionCorteCaja[];
  };
  resumen: {
    totalTransacciones: number;
    cantidadEfectivo: number;
    cantidadTransferencia: number;
    cantidadTarjeta: number;
  };
}

export class ReporteService {
  static async obtenerResumenFinanciero(filtros: FiltrosReporte): Promise<ResumenFinanciero> {
    try {
      const response = await axios.post('/api/reportes/financiero/resumen', filtros);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener resumen financiero:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el resumen financiero');
    }
  }

  static async obtenerDetalleIngresos(filtros: FiltrosReporte): Promise<DetalleIngreso[]> {
    try {
      const response = await axios.post('/api/reportes/financiero/ingresos', filtros);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener detalle de ingresos:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el detalle de ingresos');
    }
  }

  static async obtenerDetalleEgresos(filtros: FiltrosReporte): Promise<DetalleEgreso[]> {
    try {
      const response = await axios.post('/api/reportes/financiero/egresos', filtros);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener detalle de egresos:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el detalle de egresos');
    }
  }

  static async obtenerDatosGrafico(filtros: FiltrosReporte): Promise<DatosGrafico> {
    try {
      const response = await axios.post('/api/reportes/financiero/grafico', filtros);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos del gráfico:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los datos del gráfico');
    }
  }

  static async obtenerCorteCaja(filtros: FiltrosReporte): Promise<CorteCaja> {
    try {
      const response = await axios.post('/api/reportes/financiero/corte-caja', filtros);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener corte de caja:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el corte de caja');
    }
  }

  static async exportarExcel(filtros: FiltrosReporte): Promise<Blob> {
    try {
      const response = await axios.post('/api/reportes/financiero/exportar', filtros, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al exportar reporte:', error);
      throw new Error(error.response?.data?.error || 'Error al exportar el reporte');
    }
  }
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
  porPieza: Array<{
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
  }>;
  porMes: Array<{
    mes: string;
    mesLabel: string;
    piezas: ReportePiezasUsadas['porPieza'];
    totalTickets: number;
    totalIngresos: number;
    totalEgresos: number;
  }>;
  detalle: Array<{
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
  }>;
}

export class ReportePiezasUsadasService {
  static async obtener(filtros: Pick<FiltrosReporte, 'fechaInicio' | 'fechaFin'>): Promise<ReportePiezasUsadas> {
    try {
      const response = await axios.post('/api/reportes/piezas-usadas', filtros);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener reporte de piezas usadas:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el reporte de piezas usadas');
    }
  }

  static async exportarExcel(filtros: Pick<FiltrosReporte, 'fechaInicio' | 'fechaFin'>): Promise<Blob> {
    try {
      const response = await axios.post('/api/reportes/piezas-usadas/exportar', filtros, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al exportar reporte de piezas usadas:', error);
      throw new Error(error.response?.data?.error || 'Error al exportar el reporte');
    }
  }
} 