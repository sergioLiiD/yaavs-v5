import { Prisma } from '@prisma/client';

export type ChecklistRespuestaDiagnostico = {
  id: number;
  checklistDiagnosticoId: number;
  checklistItemId: number;
  respuesta: string;
  observaciones?: string | null;
  createdAt: Date;
  updatedAt: Date;
  checklistItem: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    paraDiagnostico: boolean;
    paraReparacion: boolean;
  };
};

export type ChecklistDiagnostico = {
  id: number;
  reparacionId: number;
  createdAt: Date;
  updatedAt: Date;
  respuestas: ChecklistRespuestaDiagnostico[];
};

export type ReparacionWithChecklist = {
  id: number;
  ticketId: number;
  tecnicoId: number;
  diagnostico: string | null;
  observaciones: string | null;
  fechaInicio: Date | null;
  fechaPausa: Date | null;
  fechaReanudacion: Date | null;
  fechaFin: Date | null;
  fotos: string[];
  videos: string[];
  checklist: any | null;
  saludBateria: number | null;
  versionSO: string | null;
  capacidad: string | null;
  codigoDesbloqueo: string | null;
  redCelular: string | null;
  createdAt: Date;
  updatedAt: Date;
  checklistDiagnostico: ChecklistDiagnostico | null;
  tecnico: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
  };
  piezas: Array<{
    id: number;
    cantidad: number;
    precioUnitario: number;
    pieza: {
      id: number;
      nombre: string;
      descripcion: string | null;
    } | null;
  }>;
};

export type EstadoTicket = 'ABIERTO' | 'EN_PROGRESO' | 'CERRADO';

export interface Ticket {
  id: number;
  numeroTicket: string;
  fechaRecepcion: Date;
  clienteId: number;
  tipoServicioId: number;
  modeloId: number;
  descripcionProblema: string | null;
  estatusReparacionId: number;
  creadorId: number;
  tecnicoAsignadoId: number | null;
  recogida: boolean;
  fechaEntrega: Date | null;
  entregado: boolean;
  cancelado: boolean;
  motivoCancelacion: string | null;
  fechaInicioDiagnostico: Date | null;
  fechaFinDiagnostico: Date | null;
  fechaInicioReparacion: Date | null;
  fechaFinReparacion: Date | null;
  createdAt: Date;
  updatedAt: Date;
  imei: string | null;
  capacidad: string | null;
  color: string | null;
  fechaCompra: Date | null;
  tipoDesbloqueo: string | null;
  codigoDesbloqueo: string | null;
  patronDesbloqueo: number[];
  redCelular: string | null;
  cliente: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
    telefonoCelular: string;
    email: string;
  };
  tipoServicio: {
    id: number;
    nombre: string;
  };
  modelo: {
    id: number;
    nombre: string;
    marca: {
      id: number;
      nombre: string;
    };
  };
  estatusReparacion: {
    id: number;
    nombre: string;
    color: string | null;
  };
  reparacion: ReparacionWithChecklist | null;
  tecnicoAsignado: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
  } | null;
  dispositivos: {
    id: number;
    color: string | null;
    capacidad: string | null;
    fechaCompra: Date | null;
    codigoDesbloqueo: string | null;
    redCelular: string | null;
    createdAt: Date;
    updatedAt: Date;
    ticketId: number | null;
  } | null;
  creador: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
  };
  presupuesto: {
    id: number;
    ticketId: number;
    manoDeObra: number;
    subtotal: number;
    iva: number;
    total: number;
    aprobado: boolean;
    fechaAprobacion: Date | null;
    pagado: boolean;
    metodoPago: string | null;
    comprobantePago: string | null;
    fechaPago: Date | null;
    anticipo: number;
    cuponDescuento: string | null;
    descuento: number;
    saldo: number;
    conceptos?: Array<{
      id: number;
      presupuestoId: number;
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
      createdAt: Date;
      updatedAt: Date;
    }>;
  } | null;
  pagos?: Array<{
    id: number;
    monto: number;
    fecha: Date;
    metodoPago: string;
  }>;
  saldo?: number;
  canEdit?: boolean;
} 