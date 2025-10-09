'use client';

import { useEffect } from 'react';

interface PresupuestoPrintProps {
  presupuesto: any;
  onClose: () => void;
}

export default function PresupuestoPrint({ presupuesto, onClose }: PresupuestoPrintProps) {
  useEffect(() => {
    // Imprimir automáticamente cuando se monta el componente
    handlePrint();
    
    // Cerrar el modal después de un momento
    const timer = setTimeout(() => {
      onClose();
    }, 500);

    return () => clearTimeout(timer);
  }, [onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUserName = (user: any) => {
    return `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim();
  };

  const calcularSubtotal = (producto: any) => {
    const subtotal = producto.precio_venta * producto.cantidad;
    const extra = producto.precio_concepto_extra || 0;
    return subtotal + extra;
  };

  const calcularTotal = () => {
    return presupuesto.productos_presupuesto_independiente.reduce((total: number, producto: any) => {
      return total + calcularSubtotal(producto);
    }, 0);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const total = calcularTotal();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Presupuesto #${presupuesto.id}</title>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 100mm auto;
            margin: 2mm;
          }
          
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 0;
            font-size: 10px;
            line-height: 1.2;
            color: #000000;
            background: white;
          }
          
          .ticket-container {
            max-width: 96mm;
            margin: 0 auto;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 3mm;
            margin-bottom: 3mm;
          }
          
          .logo {
            height: 15mm;
            width: auto;
            margin-bottom: 2mm;
          }
          
          .ticket-title {
            font-size: 12px;
            font-weight: bold;
            color: #000;
            margin-bottom: 1mm;
            text-transform: uppercase;
          }
          
          .ticket-subtitle {
            font-size: 9px;
            color: #000;
            margin-bottom: 2mm;
          }
          
          .ticket-number {
            font-size: 11px;
            font-weight: bold;
            color: #000;
            border: 1px solid #000;
            padding: 2mm 4mm;
            display: inline-block;
          }
          
          .section {
            margin-bottom: 3mm;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 10px;
            font-weight: bold;
            color: #000;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
            text-transform: uppercase;
          }
          
          .info-item {
            margin-bottom: 1mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .info-label {
            font-size: 8px;
            color: #000;
            text-transform: uppercase;
            font-weight: bold;
            margin-right: 2mm;
            flex-shrink: 0;
            width: 25mm;
          }
          
          .info-value {
            font-size: 9px;
            font-weight: bold;
            color: #000;
            flex: 1;
            word-break: break-word;
          }
          
          .productos-list {
            border: 1px solid #000;
            padding: 2mm;
            margin: 2mm 0;
          }
          
          .producto-item {
            border-bottom: 1px solid #000;
            padding: 2mm 0;
            font-size: 8px;
          }
          
          .producto-item:last-child {
            border-bottom: none;
          }
          
          .producto-nombre {
            font-size: 9px;
            font-weight: bold;
            color: #000;
            margin-bottom: 1mm;
          }
          
          .producto-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5mm;
            font-weight: bold;
          }
          
          .concepto-extra {
            font-size: 8px;
            color: #000;
            margin-left: 2mm;
            margin-top: 1mm;
            padding: 1mm;
            background: #f0f0f0;
            border-left: 2px solid #000;
          }
          
          .total-section {
            border: 2px solid #000;
            padding: 2mm;
            margin-top: 3mm;
            text-align: center;
          }
          
          .total-label {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 1mm;
          }
          
          .total-value {
            font-size: 14px;
            font-weight: bold;
            color: #000;
          }
          
          .descripcion-box {
            border: 1px solid #000;
            padding: 2mm;
            margin: 2mm 0;
            font-size: 8px;
            line-height: 1.3;
          }
          
          .footer {
            margin-top: 3mm;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            color: #000;
            border-top: 1px solid #000;
            padding-top: 2mm;
          }
          
          .separator {
            border-top: 1px solid #000;
            margin: 2mm 0;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            .ticket-container {
              max-width: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <!-- Header -->
          <div class="header">
            <img src="/logo.png" alt="Arregla.mx" class="logo" onerror="this.style.display='none'">
            <div class="ticket-title">PRESUPUESTO</div>
            <div class="ticket-subtitle">Arregla.mx - Plaza Ecatepec local D1 y D2</div>
            <div class="ticket-number">Presupuesto #${presupuesto.id}</div>
          </div>
          
          <!-- Información del Presupuesto -->
          <div class="section">
            <div class="section-title">INFORMACIÓN</div>
            <div class="info-item">
              <div class="info-label">Nombre:</div>
              <div class="info-value">${presupuesto.nombre || 'Sin nombre'}</div>
            </div>
            ${presupuesto.cliente_nombre ? `
              <div class="info-item">
                <div class="info-label">Cliente:</div>
                <div class="info-value">${presupuesto.cliente_nombre}</div>
              </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Fecha:</div>
              <div class="info-value">${formatDate(presupuesto.created_at)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Creado por:</div>
              <div class="info-value">${formatUserName(presupuesto.usuarios)}</div>
            </div>
          </div>
          
          ${presupuesto.descripcion ? `
            <div class="section">
              <div class="section-title">DESCRIPCIÓN</div>
              <div class="descripcion-box">${presupuesto.descripcion}</div>
            </div>
          ` : ''}
          
          <!-- Productos y Servicios -->
          <div class="section">
            <div class="section-title">PRODUCTOS Y SERVICIOS</div>
            <div class="productos-list">
              ${presupuesto.productos_presupuesto_independiente.map((producto: any) => {
                const subtotalProducto = producto.precio_venta * producto.cantidad;
                const totalConExtra = calcularSubtotal(producto);
                
                return `
                  <div class="producto-item">
                    <div class="producto-nombre">
                      ${producto.productos?.nombre || 'Producto no especificado'}
                      ${producto.productos?.sku ? `<br><span style="font-size: 7px; font-weight: normal;">SKU: ${producto.productos.sku}</span>` : ''}
                    </div>
                    <div class="producto-details">
                      <span>Cant: ${producto.cantidad}</span>
                      <span>P.U: $${producto.precio_venta.toFixed(2)}</span>
                      <span>Subtotal: $${subtotalProducto.toFixed(2)}</span>
                    </div>
                    ${producto.concepto_extra && producto.precio_concepto_extra ? `
                      <div class="concepto-extra">
                        <strong>+ ${producto.concepto_extra}</strong>
                        <br>
                        <span>Monto: $${producto.precio_concepto_extra.toFixed(2)}</span>
                        <br>
                        <span>Total con extra: $${totalConExtra.toFixed(2)}</span>
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <!-- Total -->
          <div class="total-section">
            <div class="total-label">TOTAL</div>
            <div class="total-value">$${total.toFixed(2)} MXN</div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>Arregla.mx</div>
            <div>Plaza Ecatepec local D1 y D2</div>
            <div>Tel: 56-3814-3944</div>
            <div style="margin-top: 2mm; font-size: 7px;">
              Este presupuesto tiene validez de 30 días
            </div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Imprimir después de que se cargue el contenido
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBF19] mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando impresión...</p>
        </div>
      </div>
    </div>
  );
}
