import { Reparacion as PrismaReparacion } from '@prisma/client';

export type ReparacionPayload = {
  diagnostico?: string;
  piezasNecesarias?: string;
  fechaDiagnostico?: Date;
  presupuesto?: number;
  fechaPresupuesto?: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  observaciones?: string;
  checklist?: string;
  saludBateria?: number;
  versionSO?: string;
};

export type Reparacion = PrismaReparacion; 