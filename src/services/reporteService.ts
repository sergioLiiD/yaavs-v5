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