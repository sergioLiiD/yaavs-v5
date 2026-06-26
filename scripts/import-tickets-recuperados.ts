/**
 * Importa tickets recuperados desde JSON (Actas de Entrega / tickets de recepción).
 * Uso:
 *   npx ts-node --project tsconfig.migration.json scripts/import-tickets-recuperados.ts --dry-run
 *   npx ts-node --project tsconfig.migration.json scripts/import-tickets-recuperados.ts
 */

import { MetodoPago, PrismaClient, TipoEntrega } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const prisma = new PrismaClient();

const DATA_DIR = path.resolve(process.cwd(), 'data/tickets-recuperados');

/** Archivos excluidos: duplicados, ilegibles o con datos financieros inconsistentes */
const EXCLUDED_FILES = new Set([
  'IMG_1919.json', // duplicado de IMG_1944
  'IMG_1928.json', // duplicado de IMG_1943 (recepción vs acta)
  'IMG_1949.json', // ilegible
  'IMG_1947.json', // financiero inconsistente
  'IMG_1956.json', // financiero inconsistente
]);

interface TicketJson {
  extraccion?: {
    archivo_origen?: string;
    tipo_documento?: string;
  };
  ticket?: {
    numero_ticket?: string | null;
    fecha_recepcion?: string | null;
    fecha_entrega?: string | null;
    descripcion_problema?: string | null;
    imei?: string | null;
    color?: string | null;
    entregado?: boolean;
    entregado_por_texto?: string | null;
  };
  cliente?: {
    nombre?: string | null;
    apellido_paterno?: string | null;
    apellido_materno?: string | null;
    nombre_completo?: string | null;
    telefono_celular?: string | null;
    email?: string | null;
  };
  dispositivo?: {
    marca_texto?: string | null;
    modelo_texto?: string | null;
    equipo_texto?: string | null;
  };
  financiero?: {
    presupuesto_total?: number | null;
    total_pagado?: number | null;
    saldo?: number | null;
    pagos?: Array<{
      metodo_pago?: string | null;
      monto?: number | null;
      referencia?: string | null;
    }>;
  };
}

interface ImportStats {
  processed: number;
  imported: number;
  skippedExisting: number;
  skippedExcluded: number;
  skippedInvalid: number;
  errors: string[];
}

function parseDate(value?: string | null, fallbackHour = 12): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T${String(fallbackHour).padStart(2, '0')}:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeColor(color?: string | null): string | null {
  if (!color) return null;
  const trimmed = color.trim();
  if (/^grin$/i.test(trimmed)) return 'Gris';
  return trimmed;
}

function normalizeProblem(description?: string | null): string {
  const value = (description || 'Sin descripción').trim();
  return value.replace(/^C67\s+/i, '');
}

function normalizeMarcaName(name: string): string {
  const map: Record<string, string> = {
    REALME: 'Realme',
    ANDROID: 'Android',
    VARIOS: 'Varios',
  };
  const upper = name.trim().toUpperCase();
  return map[upper] || name.trim().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/^Apple$/i, 'Apple').replace(/^Samsung$/i, 'Samsung').replace(/^Motorola$/i, 'Motorola').replace(/^Xiaomi$/i, 'Xiaomi').replace(/^Huawei$/i, 'Huawei').replace(/^Oppo$/i, 'Oppo').replace(/^Zte$/i, 'ZTE').replace(/^Realme$/i, 'Realme');
}

function normalizeMetodoPago(value?: string | null): MetodoPago {
  const normalized = (value || 'EFECTIVO').toUpperCase();
  if (normalized.includes('TARJ')) return MetodoPago.TARJETA;
  if (normalized.includes('TRANS')) return MetodoPago.TRANSFERENCIA;
  return MetodoPago.EFECTIVO;
}

function isFinanciallyConsistent(data: TicketJson): boolean {
  const f = data.financiero;
  if (!f || f.presupuesto_total == null || f.total_pagado == null || f.saldo == null) {
    return false;
  }
  const pres = Number(f.presupuesto_total);
  const pagado = Number(f.total_pagado);
  const saldo = Number(f.saldo);
  if (Math.abs(pres - pagado - saldo) > 0.01) return false;
  const pagos = f.pagos || [];
  if (pagos.length > 0) {
    const sum = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    if (Math.abs(sum - pagado) > 0.01) return false;
  }
  return true;
}

async function findOrCreateMarca(nombre: string, dryRun: boolean) {
  const normalized = normalizeMarcaName(nombre);
  const existing = await prisma.marcas.findFirst({
    where: { nombre: { equals: normalized, mode: 'insensitive' } },
  });
  if (existing) return existing;
  if (dryRun) return { id: -1, nombre: normalized };
  return prisma.marcas.create({
    data: { nombre: normalized, updated_at: new Date() },
  });
}

async function findOrCreateModelo(marcaId: number, nombre: string, dryRun: boolean) {
  const modelName = nombre.trim();
  const existing = await prisma.modelos.findFirst({
    where: {
      marca_id: marcaId,
      nombre: { equals: modelName, mode: 'insensitive' },
    },
  });
  if (existing) return existing;
  if (dryRun) return { id: -1, nombre: modelName, marca_id: marcaId };
  return prisma.modelos.create({
    data: {
      nombre: modelName,
      marca_id: marcaId,
      updated_at: new Date(),
    },
  });
}

async function findOrCreateCliente(data: TicketJson, numeroTicket: string, dryRun: boolean) {
  const c = data.cliente || {};
  const nombre = (c.nombre || 'Sin').trim();
  const apellidoPaterno = (c.apellido_paterno || 'Nombre').trim();
  const apellidoMaterno = c.apellido_materno?.trim() || null;
  const telefono = c.telefono_celular?.replace(/\D/g, '') || `REC${numeroTicket.replace(/\D/g, '').slice(-10)}`;
  const email = c.email?.trim() || `recuperado+${numeroTicket.toLowerCase()}@import.local`;

  const existing = await prisma.clientes.findFirst({
    where: {
      nombre: { equals: nombre, mode: 'insensitive' },
      apellido_paterno: { equals: apellidoPaterno, mode: 'insensitive' },
      ...(apellidoMaterno
        ? { apellido_materno: { equals: apellidoMaterno, mode: 'insensitive' } }
        : {}),
    },
  });
  if (existing) return existing;

  if (dryRun) {
    return {
      id: -1,
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
    };
  }

  return prisma.clientes.create({
    data: {
      nombre,
      apellido_paterno: apellidoPaterno,
      apellido_materno: apellidoMaterno,
      telefono_celular: telefono,
      email,
      tipo_registro: 'recuperacion_manual',
      fuente_referencia: data.extraccion?.archivo_origen || null,
      updated_at: new Date(),
    },
  });
}

async function resolveCatalogIds(dryRun: boolean) {
  const tipoServicio = await prisma.tipos_servicio.findFirst({
    where: { nombre: { contains: 'Celulares', mode: 'insensitive' } },
  });
  if (!tipoServicio && !dryRun) {
    throw new Error('No se encontró tipo de servicio "Reparación de Celulares"');
  }

  const puntoRecoleccion = await prisma.puntos_recoleccion.findFirst({
    where: {
      OR: [
        { nombre: { contains: 'Ecatepec', mode: 'insensitive' } },
        { is_repair_point: true },
        { activo: true },
      ],
    },
    orderBy: { id: 'asc' },
  });

  const estatus = {
    entregado: await prisma.estatus_reparacion.findFirst({ where: { nombre: 'Entregado' } }),
    reparado: await prisma.estatus_reparacion.findFirst({ where: { nombre: 'Reparado' } }),
    enReparacion: await prisma.estatus_reparacion.findFirst({ where: { nombre: 'En Reparación' } }),
    recibido: await prisma.estatus_reparacion.findFirst({ where: { nombre: 'Recibido' } }),
  };

  if (!dryRun && (!estatus.entregado || !estatus.enReparacion || !estatus.recibido)) {
    throw new Error('Faltan estatus de reparación requeridos en la base de datos');
  }

  const adminUser = await prisma.usuarios.findFirst({
    where: {
      activo: true,
      usuarios_roles: {
        some: {
          roles: {
            nombre: 'ADMINISTRADOR',
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  const creadorUser =
    adminUser ||
    (await prisma.usuarios.findFirst({
      where: { activo: true },
      orderBy: { id: 'asc' },
    }));

  if (!creadorUser && !dryRun) {
    throw new Error('No se encontró un usuario activo para asignar como creador');
  }

  return {
    tipoServicioId: tipoServicio?.id ?? -1,
    puntoRecoleccionId: puntoRecoleccion?.id ?? null,
    creadorId: creadorUser?.id ?? -1,
    estatus,
  };
}

function resolveEstatusId(
  data: TicketJson,
  estatus: Awaited<ReturnType<typeof resolveCatalogIds>>['estatus']
): number {
  const entregado = data.ticket?.entregado === true;
  const saldo = Number(data.financiero?.saldo ?? 0);

  if (entregado) return estatus.entregado!.id;
  if (saldo > 0) return estatus.enReparacion!.id;
  if (estatus.reparado) return estatus.reparado.id;
  return estatus.recibido!.id;
}

async function importOneTicket(
  fileName: string,
  data: TicketJson,
  catalog: Awaited<ReturnType<typeof resolveCatalogIds>>,
  dryRun: boolean
): Promise<'imported' | 'skippedExisting' | 'skippedInvalid'> {
  const numeroTicket = data.ticket?.numero_ticket?.trim();
  if (!numeroTicket || !/^TICK-\d+$/.test(numeroTicket)) {
    console.log(`  ⚠️  ${fileName}: numero_ticket inválido o faltante`);
    return 'skippedInvalid';
  }

  if (!isFinanciallyConsistent(data)) {
    console.log(`  ⚠️  ${fileName}: datos financieros inconsistentes`);
    return 'skippedInvalid';
  }

  const existing = await prisma.tickets.findUnique({
    where: { numero_ticket: numeroTicket },
    select: { id: true, numero_ticket: true },
  });
  if (existing) {
    console.log(`  ↩️  ${fileName}: ya existe ${numeroTicket} (id ${existing.id})`);
    return 'skippedExisting';
  }

  const marcaNombre = data.dispositivo?.marca_texto?.trim();
  const modeloNombre = data.dispositivo?.modelo_texto?.trim();
  if (!marcaNombre || !modeloNombre) {
    console.log(`  ⚠️  ${fileName}: falta marca o modelo`);
    return 'skippedInvalid';
  }

  const presupuestoTotal = Number(data.financiero!.presupuesto_total);
  const saldo = Number(data.financiero!.saldo);
  const fechaRecepcion = parseDate(data.ticket?.fecha_recepcion) || new Date();
  const fechaEntrega = data.ticket?.entregado ? parseDate(data.ticket?.fecha_entrega, 13) : null;
  const entregado = data.ticket?.entregado === true;
  const estatusId = resolveEstatusId(data, catalog.estatus);

  if (dryRun) {
    console.log(
      `  ✅ [dry-run] ${numeroTicket} | ${data.cliente?.nombre_completo} | ${marcaNombre} ${modeloNombre} | $${presupuestoTotal} | entregado=${entregado}`
    );
    return 'imported';
  }

  const marca = await findOrCreateMarca(marcaNombre, false);
  const modelo = await findOrCreateModelo(marca.id, modeloNombre, false);
  const cliente = await findOrCreateCliente(data, numeroTicket, false);

  const ticket = await prisma.$transaction(async (tx) => {
    const createdTicket = await tx.tickets.create({
      data: {
        numero_ticket: numeroTicket,
        fecha_recepcion: fechaRecepcion,
        fecha_entrega: fechaEntrega,
        descripcion_problema: normalizeProblem(data.ticket?.descripcion_problema),
        imei: data.ticket?.imei || null,
        color: normalizeColor(data.ticket?.color),
        entregado,
        recuperacion_manual: true,
        cliente_id: cliente.id,
        tipo_servicio_id: catalog.tipoServicioId,
        modelo_id: modelo.id,
        estatus_reparacion_id: estatusId,
        creador_id: catalog.creadorId,
        punto_recoleccion_id: catalog.puntoRecoleccionId,
        updated_at: new Date(),
      },
    });

    const presupuesto = await tx.presupuestos.create({
      data: {
        ticket_id: createdTicket.id,
        total: presupuestoTotal,
        descuento: 0,
        total_final: presupuestoTotal,
        saldo,
        pagado: saldo <= 0,
        aprobado: true,
        fecha_aprobacion: fechaRecepcion,
        updated_at: new Date(),
        conceptos_presupuesto: {
          create: {
            descripcion: normalizeProblem(data.ticket?.descripcion_problema),
            cantidad: 1,
            precio_unitario: presupuestoTotal,
            total: presupuestoTotal,
            updated_at: new Date(),
          },
        },
      },
    });

    const pagos = data.financiero?.pagos || [];
    for (const pago of pagos) {
      await tx.pagos.create({
        data: {
          ticket_id: createdTicket.id,
          monto: Number(pago.monto),
          metodo: normalizeMetodoPago(pago.metodo_pago),
          referencia: pago.referencia || null,
          created_at: fechaEntrega || fechaRecepcion,
          updated_at: new Date(),
        },
      });
    }

    if (entregado) {
      await tx.entregas.create({
        data: {
          ticket_id: createdTicket.id,
          tipo: TipoEntrega.PUNTO_RECOLECCION,
          notas: `Importación manual. Entregado por: ${data.ticket?.entregado_por_texto || 'N/D'}. Fuente: ${data.extraccion?.archivo_origen || fileName}`,
          updated_at: new Date(),
        },
      });
    }

    return { ticket: createdTicket, presupuesto };
  });

  console.log(
    `  ✅ Importado ${numeroTicket} → ticket #${ticket.ticket.id} | ${data.cliente?.nombre_completo}`
  );
  return 'imported';
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const stats: ImportStats = {
    processed: 0,
    imported: 0,
    skippedExisting: 0,
    skippedExcluded: 0,
    skippedInvalid: 0,
    errors: [],
  };

  console.log(`\n📦 Importación de tickets recuperados ${dryRun ? '(DRY RUN)' : ''}`);
  console.log(`📁 Origen: ${DATA_DIR}\n`);

  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`No existe la carpeta ${DATA_DIR}`);
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json')).sort();
  const catalog = await resolveCatalogIds(dryRun);

  console.log(`Tipo servicio ID: ${catalog.tipoServicioId}`);
  console.log(`Punto recolección ID: ${catalog.puntoRecoleccionId ?? 'N/A'}`);
  console.log(`Creador ID: ${catalog.creadorId}\n`);

  for (const file of files) {
    if (EXCLUDED_FILES.has(file)) {
      console.log(`  ⏭️  ${file}: excluido`);
      stats.skippedExcluded++;
      continue;
    }

    stats.processed++;
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
      const data = JSON.parse(raw) as TicketJson;
      const result = await importOneTicket(file, data, catalog, dryRun);
      if (result === 'imported') stats.imported++;
      else if (result === 'skippedExisting') stats.skippedExisting++;
      else stats.skippedInvalid++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      stats.errors.push(`${file}: ${message}`);
      console.error(`  ❌ ${file}: ${message}`);
    }
  }

  console.log('\n=== RESUMEN ===');
  console.log(`Archivos totales: ${files.length}`);
  console.log(`Excluidos: ${stats.skippedExcluded}`);
  console.log(`Procesados: ${stats.processed}`);
  console.log(`Importados: ${stats.imported}`);
  console.log(`Ya existían: ${stats.skippedExisting}`);
  console.log(`Inválidos/omitidos: ${stats.skippedInvalid}`);
  console.log(`Errores: ${stats.errors.length}`);
  if (stats.errors.length) {
    console.log('\nDetalle de errores:');
    stats.errors.forEach((e) => console.log(`  - ${e}`));
  }
}

main()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
