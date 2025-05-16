import { Prisma } from '@prisma/client';

export type ChecklistDiagnostico = {
  id: number;
  reparacionId: number;
  item: string;
  respuesta: boolean;
  observacion?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReparacionWithChecklist = {
  id: number;
  ticketId: number;
  tecnicoId: number;
  diagnostico: string | null;
  observaciones: string | null;
  fechaInicio: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fechaDiagnostico: Date | null;
  fechaFin: Date | null;
  fechaPresupuesto: Date | null;
  piezasNecesarias: string | null;
  presupuesto: number | null;
  saludBateria: number | null;
  versionSO: string | null;
  checklistItems: ChecklistDiagnostico[];
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
    };
  }>;
};

export type Ticket = {
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
  dispositivo: {
    id: number;
    imei: string | null;
    capacidad: string | null;
    color: string | null;
    fechaCompra: Date | null;
    codigoDesbloqueo: string | null;
    redCelular: string | null;
  } | null;
  creador: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
  };
}; 