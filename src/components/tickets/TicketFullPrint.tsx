import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Ticket {
  id: number;
  numeroTicket: string;
  fechaRecepcion: string;
  descripcionProblema: string | null;
  imei?: string;
  cliente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefonoCelular: string;
    email: string;
  };
  modelo?: {
    id: number;
    nombre: string;
    marca: {
      id: number;
      nombre: string;
    };
  };
  tipoServicio?: {
    id: number;
    nombre: string;
  };
  estatusReparacion?: {
    id: number;
    nombre: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  } | null;
  dispositivo?: {
    id: number;
    tipo: string;
    marca: string;
    modelo: string;
  };
  presupuesto?: {
    id: number;
    total: number;
    descuento: number;
    totalFinal: number;
    aprobado: boolean;
    fechaAprobacion?: string;
    conceptos: {
      id: number;
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      total: number;
    }[];
  };
  pagos?: {
    id: number;
    monto: number;
    fecha: string;
    metodoPago: string;
    referencia?: string;
  }[];
}

interface TicketFullPrintProps {
  ticket: Ticket;
}

export function TicketFullPrint({ ticket }: TicketFullPrintProps) {
  const handlePrintTicket = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket Completo #${ticket.numeroTicket}</title>
          <style>
            @page {
              size: A4;
              margin: 1cm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
            }
            
            .ticket-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              height: 60px;
              width: auto;
              margin-bottom: 10px;
            }
            
            .ticket-title {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .ticket-subtitle {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            
            .ticket-number {
              font-size: 20px;
              font-weight: bold;
              color: #333;
              background: #f3f4f6;
              padding: 10px 20px;
              border-radius: 8px;
              display: inline-block;
            }
            
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            
            .info-item {
              margin-bottom: 12px;
            }
            
            .info-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              font-weight: bold;
              margin-bottom: 4px;
            }
            
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
            }
            
            .problem-description {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
              font-size: 14px;
              line-height: 1.6;
            }
            
            .conceptos-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            
            .conceptos-table th {
              background: #f3f4f6;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              border-bottom: 2px solid #d1d5db;
            }
            
            .conceptos-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
            }
            
            .conceptos-table .text-right {
              text-align: right;
            }
            
            .pagos-list {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
            }
            
            .pago-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .pago-item:last-child {
              border-bottom: none;
            }
            
            .total-section {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              border: 2px solid #0ea5e9;
              margin-top: 20px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            
            .total-final {
              font-size: 20px;
              font-weight: bold;
              color: #0c4a6e;
              border-top: 2px solid #0ea5e9;
              padding-top: 10px;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
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
            <div class="header">
              <img src="/logo.png" alt="Arregla.mx" class="logo" onerror="this.style.display='none'">
              <div class="ticket-title">TICKET DE REPARACIÓN</div>
              <div class="ticket-subtitle">Arregla.mx - Plaza Ecatepec local D1 y D2</div>
              <div class="ticket-number">Ticket #${ticket.numeroTicket}</div>
            </div>
            
            <div class="section">
              <div class="section-title">📱 Información del Dispositivo</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Marca</div>
                  <div class="info-value">${ticket.modelo?.marca.nombre || 'No disponible'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Modelo</div>
                  <div class="info-value">${ticket.modelo?.nombre || 'No disponible'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">IMEI</div>
                  <div class="info-value">${ticket.imei || 'No disponible'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Tipo de Servicio</div>
                  <div class="info-value">${ticket.tipoServicio?.nombre || 'No disponible'}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">👤 Información del Cliente</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Nombre Completo</div>
                  <div class="info-value">
                    ${ticket.cliente ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno || ''}` : 'No disponible'}
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-label">Teléfono</div>
                  <div class="info-value">${ticket.cliente?.telefonoCelular || 'No disponible'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${ticket.cliente?.email || 'No disponible'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Fecha de Recepción</div>
                  <div class="info-value">${new Date(ticket.fechaRecepcion).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">🔧 Descripción del Problema</div>
              <div class="problem-description">
                ${ticket.descripcionProblema || 'No disponible'}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">👨‍🔧 Información del Servicio</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Estado Actual</div>
                  <div class="info-value">${ticket.estatusReparacion?.nombre || 'No disponible'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Técnico Asignado</div>
                  <div class="info-value">
                    ${ticket.tecnicoAsignado ? 
                      `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidoPaterno} ${ticket.tecnicoAsignado.apellidoMaterno || ''}` : 
                      'No asignado'}
                  </div>
                </div>
              </div>
            </div>
            
            ${ticket.presupuesto ? `
              <div class="section">
                <div class="section-title">💰 Presupuesto</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Estado</div>
                    <div class="info-value">${ticket.presupuesto.aprobado ? '✅ Aprobado' : '⏳ Pendiente'}</div>
                  </div>
                  ${ticket.presupuesto.fechaAprobacion ? `
                    <div class="info-item">
                      <div class="info-label">Fecha de Aprobación</div>
                      <div class="info-value">${new Date(ticket.presupuesto.fechaAprobacion).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</div>
                    </div>
                  ` : ''}
                </div>
                
                ${ticket.presupuesto.conceptos.length > 0 ? `
                  <table class="conceptos-table">
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th class="text-right">Cantidad</th>
                        <th class="text-right">Precio Unit.</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${ticket.presupuesto.conceptos.map(concepto => `
                        <tr>
                          <td>${concepto.descripcion}</td>
                          <td class="text-right">${concepto.cantidad}</td>
                          <td class="text-right">$${concepto.precioUnitario.toFixed(2)}</td>
                          <td class="text-right">$${concepto.total.toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  
                  <div class="total-section">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>$${ticket.presupuesto.total.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                      <span>Descuento:</span>
                      <span>$${ticket.presupuesto.descuento.toFixed(2)}</span>
                    </div>
                    <div class="total-row total-final">
                      <span>TOTAL FINAL:</span>
                      <span>$${ticket.presupuesto.totalFinal.toFixed(2)}</span>
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${ticket.pagos && ticket.pagos.length > 0 ? `
              <div class="section">
                <div class="section-title">💳 Pagos Realizados</div>
                <div class="pagos-list">
                  ${ticket.pagos.map(pago => `
                    <div class="pago-item">
                      <div>
                        <div style="font-weight: bold;">${new Date(pago.fecha).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                        <div style="font-size: 11px; color: #6b7280;">${pago.metodoPago}</div>
                      </div>
                      <div style="font-weight: bold; color: #059669;">$${pago.monto.toFixed(2)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Este documento fue generado automáticamente por el sistema de Arregla.mx</p>
              <p>Fecha de impresión: ${new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <button
      onClick={handlePrintTicket}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-2"
    >
      🖨️ Imprimir Ticket
    </button>
  );
}
