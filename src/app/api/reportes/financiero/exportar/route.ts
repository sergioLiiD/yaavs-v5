import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);

    // ============================================
    // HOJA 1: RESUMEN FINANCIERO
    // ============================================
    const [ventasProductos, pagosReparacion, comprasInsumos] = await Promise.all([
      prisma.ventas.aggregate({
        where: {
          created_at: { gte: fechaInicioDate, lte: fechaFinDate },
          estado: 'COMPLETADA'
        },
        _sum: { total: true }
      }),
      prisma.pagos.aggregate({
        where: {
          created_at: { gte: fechaInicioDate, lte: fechaFinDate },
          estado: 'ACTIVO' // Solo contar pagos activos
        },
        _sum: { monto: true }
      }),
      prisma.entradas_almacen.findMany({
        where: {
          fecha: { gte: fechaInicioDate, lte: fechaFinDate }
        },
        select: { precio_compra: true, cantidad: true }
      })
    ]);

    const ingresosVentasProductos = ventasProductos._sum?.total || 0;
    const ingresosServiciosReparacion = pagosReparacion._sum?.monto || 0;
    const egresosComprasInsumos = comprasInsumos.reduce((total, entrada) => 
      total + (entrada.precio_compra * entrada.cantidad), 0
    );

    const ingresosTotales = ingresosVentasProductos + ingresosServiciosReparacion;
    const egresosTotales = egresosComprasInsumos;
    const balance = ingresosTotales - egresosTotales;

    const resumenData = [
      ['RESUMEN FINANCIERO'],
      [`Período: ${fechaInicio} al ${fechaFin}`],
      [],
      ['INGRESOS'],
      ['Ventas de Productos', ingresosVentasProductos],
      ['Servicios de Reparación', ingresosServiciosReparacion],
      ['Total Ingresos', ingresosTotales],
      [],
      ['EGRESOS'],
      ['Compras de Insumos', egresosComprasInsumos],
      ['Total Egresos', egresosTotales],
      [],
      ['BALANCE', balance]
    ];

    // ============================================
    // HOJA 2: DETALLE DE INGRESOS
    // ============================================
    const ventasDetalle = await prisma.ventas.findMany({
      where: {
        created_at: { gte: fechaInicioDate, lte: fechaFinDate },
        estado: 'COMPLETADA'
      },
      include: {
        clientes: {
          select: { nombre: true, apellido_paterno: true, apellido_materno: true }
        },
        detalle_ventas: {
          include: { productos: { select: { nombre: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const pagosDetalle = await prisma.pagos.findMany({
      where: {
        created_at: { gte: fechaInicioDate, lte: fechaFinDate },
        estado: 'ACTIVO' // Solo incluir pagos activos
      },
      include: {
        tickets: {
          include: {
            clientes: {
              select: { nombre: true, apellido_paterno: true, apellido_materno: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const ingresosData = [
      ['DETALLE DE INGRESOS'],
      ['Fecha', 'Tipo', 'Cliente', 'Monto', 'Método de Pago', 'Referencia'],
    ];

    // Agregar ventas
    ventasDetalle.forEach(venta => {
      const nombreCliente = `${venta.clientes?.nombre || ''} ${venta.clientes?.apellido_paterno || ''} ${venta.clientes?.apellido_materno || ''}`.trim();
      ingresosData.push([
        new Date(venta.created_at).toLocaleString('es-MX'),
        'Venta de Producto',
        nombreCliente,
        venta.total,
        'Efectivo',
        `Venta #${venta.id}`
      ]);
    });

    // Agregar pagos de reparación
    pagosDetalle.forEach(pago => {
      const nombreCliente = `${pago.tickets?.clientes?.nombre || ''} ${pago.tickets?.clientes?.apellido_paterno || ''} ${pago.tickets?.clientes?.apellido_materno || ''}`.trim();
      ingresosData.push([
        new Date(pago.created_at).toLocaleString('es-MX'),
        'Pago de Reparación',
        nombreCliente,
        pago.monto,
        pago.metodo,
        pago.referencia || `Pago #${pago.id}`
      ]);
    });

    // ============================================
    // HOJA 3: DETALLE DE EGRESOS
    // ============================================
    const comprasDetalle = await prisma.entradas_almacen.findMany({
      where: {
        fecha: { gte: fechaInicioDate, lte: fechaFinDate }
      },
      include: {
        productos: { select: { nombre: true } },
        proveedores: { select: { nombre: true } },
        usuarios: { select: { nombre: true, apellido_paterno: true } }
      },
      orderBy: { fecha: 'desc' }
    });

    const egresosData = [
      ['DETALLE DE EGRESOS'],
      ['Fecha', 'Proveedor', 'Producto', 'Cantidad', 'Precio Compra', 'Total', 'Registrado por'],
    ];

    comprasDetalle.forEach(entrada => {
      const nombreUsuario = `${entrada.usuarios?.nombre || ''} ${entrada.usuarios?.apellido_paterno || ''}`.trim();
      const total = entrada.precio_compra * entrada.cantidad;
      egresosData.push([
        new Date(entrada.fecha).toLocaleString('es-MX'),
        entrada.proveedores?.nombre || 'Sin proveedor',
        entrada.productos?.nombre || 'Sin nombre',
        entrada.cantidad,
        entrada.precio_compra,
        total,
        nombreUsuario
      ]);
    });

    // ============================================
    // HOJA 4: CORTE DE CAJA
    // ============================================
    const pagosCorteCaja = await prisma.pagos.findMany({
      where: {
        created_at: { gte: fechaInicioDate, lte: fechaFinDate },
        estado: 'ACTIVO' // Solo incluir pagos activos
      },
      include: {
        tickets: {
          include: {
            clientes: {
              select: { nombre: true, apellido_paterno: true, apellido_materno: true }
            }
          }
        }
      },
      orderBy: [
        { metodo: 'asc' },
        { created_at: 'desc' }
      ]
    });

    // Calcular totales por método
    const totalesMetodo = {
      EFECTIVO: 0,
      TRANSFERENCIA: 0,
      TARJETA: 0
    };

    pagosCorteCaja.forEach(pago => {
      totalesMetodo[pago.metodo] += pago.monto;
    });

    const corteCajaData = [
      ['CORTE DE CAJA'],
      [`Período: ${fechaInicio} al ${fechaFin}`],
      [],
      ['RESUMEN'],
      ['Método de Pago', 'Cantidad de Pagos', 'Total'],
      ['Efectivo', pagosCorteCaja.filter(p => p.metodo === 'EFECTIVO').length, totalesMetodo.EFECTIVO],
      ['Transferencia/Depósito', pagosCorteCaja.filter(p => p.metodo === 'TRANSFERENCIA').length, totalesMetodo.TRANSFERENCIA],
      ['Tarjeta', pagosCorteCaja.filter(p => p.metodo === 'TARJETA').length, totalesMetodo.TARJETA],
      ['TOTAL GENERAL', pagosCorteCaja.length, totalesMetodo.EFECTIVO + totalesMetodo.TRANSFERENCIA + totalesMetodo.TARJETA],
      [],
      ['DETALLE DE TRANSACCIONES'],
      ['Fecha', 'Hora', 'Cliente', 'Monto', 'Método de Pago', 'Número de Ticket', 'Referencia'],
    ];

    // Agrupar por método
    ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].forEach(metodo => {
      const pagosPorMetodo = pagosCorteCaja.filter(p => p.metodo === metodo);
      
      if (pagosPorMetodo.length > 0) {
        corteCajaData.push([]);
        corteCajaData.push([`=== ${metodo} (${pagosPorMetodo.length} pagos - $${totalesMetodo[metodo as keyof typeof totalesMetodo]}) ===`]);
        
        pagosPorMetodo.forEach(pago => {
          const nombreCliente = `${pago.tickets?.clientes?.nombre || ''} ${pago.tickets?.clientes?.apellido_paterno || ''} ${pago.tickets?.clientes?.apellido_materno || ''}`.trim();
          const fecha = new Date(pago.created_at);
          
          corteCajaData.push([
            fecha.toLocaleDateString('es-MX'),
            fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            nombreCliente,
            pago.monto,
            pago.metodo,
            pago.tickets?.numero_ticket || 'N/A',
            pago.referencia || ''
          ]);
        });
      }
    });

    // ============================================
    // CREAR ARCHIVO EXCEL
    // ============================================
    const workbook = XLSX.utils.book_new();

    // Crear hojas
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    const wsIngresos = XLSX.utils.aoa_to_sheet(ingresosData);
    const wsEgresos = XLSX.utils.aoa_to_sheet(egresosData);
    const wsCorteCaja = XLSX.utils.aoa_to_sheet(corteCajaData);

    // Agregar hojas al libro
    XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
    XLSX.utils.book_append_sheet(workbook, wsIngresos, 'Ingresos');
    XLSX.utils.book_append_sheet(workbook, wsEgresos, 'Egresos');
    XLSX.utils.book_append_sheet(workbook, wsCorteCaja, 'Corte de Caja');

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Retornar el archivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reporte-financiero-${fechaInicio}-${fechaFin}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error al exportar reporte:', error);
    return NextResponse.json(
      { error: 'Error al exportar el reporte' },
      { status: 500 }
    );
  }
}

