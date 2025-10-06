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
              size: 100mm auto;
              margin: 2mm;
            }
            
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 0;
              font-size: 8px;
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
              font-size: 10px;
              font-weight: bold;
              color: #000;
              margin-bottom: 1mm;
              text-transform: uppercase;
            }
            
            .ticket-subtitle {
              font-size: 7px;
              color: #000;
              margin-bottom: 2mm;
            }
            
            .ticket-number {
              font-size: 9px;
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
              font-size: 8px;
              font-weight: bold;
              color: #000;
              border-bottom: 1px solid #000;
              padding-bottom: 1mm;
              margin-bottom: 2mm;
              text-transform: uppercase;
            }
            
            .info-grid {
              display: block;
            }
            
            .info-item {
              margin-bottom: 1mm;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .info-label {
              font-size: 6px;
              color: #000;
              text-transform: uppercase;
              font-weight: bold;
              margin-right: 2mm;
              flex-shrink: 0;
              width: 25mm;
            }
            
            .info-value {
              font-size: 7px;
              font-weight: bold;
              color: #000;
              flex: 1;
              word-break: break-word;
            }
            
            .problem-description {
              border: 1px solid #000;
              padding: 2mm;
              font-size: 7px;
              font-weight: bold;
              line-height: 1.3;
              margin-top: 1mm;
            }
            
            .conceptos-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 2mm;
              font-size: 6px;
            }
            
            .conceptos-table th {
              border: 1px solid #000;
              padding: 1mm;
              text-align: left;
              font-weight: bold;
              background: white;
            }
            
            .conceptos-table td {
              border: 1px solid #000;
              padding: 1mm;
              border-top: none;
              font-weight: bold;
            }
            
            .conceptos-table .text-right {
              text-align: right;
            }
            
            .pagos-list {
              border: 1px solid #000;
              padding: 2mm;
            }
            
            .pago-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1mm 0;
              border-bottom: 1px solid #000;
              font-size: 7px;
              font-weight: bold;
            }
            
            .pago-item:last-child {
              border-bottom: none;
            }
            
            .total-section {
              border: 2px solid #000;
              padding: 2mm;
              margin-top: 2mm;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 1mm;
              font-size: 7px;
              font-weight: bold;
            }
            
            .total-final {
              font-size: 9px;
              font-weight: bold;
              color: #000;
              border-top: 1px solid #000;
              padding-top: 1mm;
              margin-top: 1mm;
            }
            
            .footer {
              margin-top: 3mm;
              text-align: center;
              font-size: 6px;
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
            <div class="header">
              <img src="/logo.png" alt="Arregla.mx" class="logo" onerror="this.style.display='none'">
              <div class="ticket-title">TICKET DE REPARACIÓN</div>
              <div class="ticket-subtitle">Arregla.mx - Plaza Ecatepec local D1 y D2</div>
              <div class="ticket-number">Ticket #${ticket.numeroTicket}</div>
            </div>
            
            <div class="section">
              <div class="section-title">DISPOSITIVO</div>
              <div class="info-item">
                <div class="info-label">Marca:</div>
                <div class="info-value">${ticket.modelo?.marca.nombre || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Modelo:</div>
                <div class="info-value">${ticket.modelo?.nombre || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">IMEI:</div>
                <div class="info-value">${ticket.imei || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Servicio:</div>
                <div class="info-value">${ticket.tipoServicio?.nombre || 'N/A'}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">CLIENTE</div>
              <div class="info-item">
                <div class="info-label">Nombre:</div>
                <div class="info-value">${ticket.cliente ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno || ''}` : 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Telefono:</div>
                <div class="info-value">${ticket.cliente?.telefonoCelular || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email:</div>
                <div class="info-value">${ticket.cliente?.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Fecha:</div>
                <div class="info-value">${new Date(ticket.fechaRecepcion).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">PROBLEMA</div>
              <div class="problem-description">
                ${ticket.descripcionProblema || 'N/A'}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">SERVICIO</div>
              <div class="info-item">
                <div class="info-label">Estado:</div>
                <div class="info-value">${ticket.estatusReparacion?.nombre || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Tecnico:</div>
                <div class="info-value">
                  ${ticket.tecnicoAsignado ? 
                    `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidoPaterno} ${ticket.tecnicoAsignado.apellidoMaterno || ''}` : 
                    'No asignado'}
                </div>
              </div>
            </div>
            
            ${ticket.presupuesto ? `
              <div class="section">
                <div class="section-title">PRESUPUESTO</div>
                <div class="info-item">
                  <div class="info-label">Estado:</div>
                  <div class="info-value">${ticket.presupuesto.aprobado ? 'APROBADO' : 'PENDIENTE'}</div>
                </div>
                ${ticket.presupuesto.fechaAprobacion ? `
                  <div class="info-item">
                    <div class="info-label">Fecha Aprob.:</div>
                    <div class="info-value">${new Date(ticket.presupuesto.fechaAprobacion).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</div>
                  </div>
                ` : ''}
                
                ${ticket.presupuesto.conceptos.length > 0 ? `
                  <table class="conceptos-table">
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th class="text-right">Cant.</th>
                        <th class="text-right">P.Unit.</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${ticket.presupuesto.conceptos.map(concepto => `
                        <tr>
                          <td>${concepto.descripcion.length > 20 ? concepto.descripcion.substring(0, 20) + '...' : concepto.descripcion}</td>
                          <td class="text-right">${concepto.cantidad}</td>
                          <td class="text-right">$${concepto.precioUnitario.toFixed(0)}</td>
                          <td class="text-right">$${concepto.total.toFixed(0)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  
                  <div class="total-section">
                    <div class="total-row">
                      <span>Subtotal:</span>
                      <span>$${ticket.presupuesto.total.toFixed(0)}</span>
                    </div>
                    <div class="total-row">
                      <span>Descuento:</span>
                      <span>$${ticket.presupuesto.descuento.toFixed(0)}</span>
                    </div>
                    <div class="total-row total-final">
                      <span>TOTAL:</span>
                      <span>$${ticket.presupuesto.totalFinal.toFixed(0)}</span>
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
            
            ${ticket.pagos && ticket.pagos.length > 0 ? `
              <div class="section">
                <div class="section-title">PAGOS</div>
                <div class="pagos-list">
                  ${ticket.pagos.map(pago => `
                    <div class="pago-item">
                      <div>
                        <div>${new Date(pago.fecha).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                        <div>${pago.metodoPago}</div>
                      </div>
                      <div>$${pago.monto.toFixed(0)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Generado por Arregla.mx</p>
              <p>${new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
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
