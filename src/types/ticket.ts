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
  fechaPausa: Date | null;
  fechaReanudacion: Date | null;
  fechaFin: Date | null;
  fotos: string[];
  videos: string[];
  checklist: any | null;
  saludBateria: number | null;
  versionSO: string | null;
  createdAt: Date;
  updatedAt: Date;
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
    } | null;
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
  fechaCancelacion: Date | null;
  direccionId: number | null;
  Presupuesto: {
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
  } | null;
  Reparacion: {
    id: number;
    ticketId: number;
    tecnicoId: number;
    observaciones: string | null;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    checklist: any | null;
    fechaPausa: Date | null;
    fechaReanudacion: Date | null;
    fotos: string[];
    videos: string[];
    diagnostico: string | null;
    saludBateria: number | null;
    versionSO: string | null;
    checklist_diagnostico: Array<{
      id: number;
      reparacionId: number;
      item: string;
      respuesta: boolean;
      observacion: string | null;
    }>;
    piezas_reparacion: Array<{
      id: number;
      cantidad: number;
      precioUnitario: number;
      piezas: {
        id: number;
        nombre: string;
        descripcion: string | null;
      } | null;
    }>;
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
  entregas: {
    id: number;
    ticketId: number;
    tipoEntrega: string;
    fechaEntrega: Date | null;
    entregado: boolean;
    observaciones: string | null;
    direccionEntregaId: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  pagos: Array<{
    id: number;
    monto: number;
    fecha: Date;
    metodoPago: string;
  }>;
  direcciones: {
    id: number;
    calle: string;
    numeroExterior: string;
    numeroInterior: string | null;
    colonia: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    latitud: number | null;
    longitud: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}; 