interface Ticket {
  id: number;
  numeroTicket: string;
  descripcionProblema: string | null;
  imei?: string;
  cliente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  };
  modelo?: {
    id: number;
    nombre: string;
    marca: {
      id: number;
      nombre: string;
    };
  };
}

interface TicketLabelPrintProps {
  ticket: Ticket;
}

export function TicketLabelPrint({ ticket }: TicketLabelPrintProps) {
  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Etiqueta de Identificación - Ticket #${ticket.numeroTicket}</title>
          <style>
            @page {
              size: 100mm 50mm;
              margin: 2mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 8px;
              line-height: 1.2;
            }
            
            .label-container {
              width: 96mm;
              height: 46mm;
              border: 1px solid #000;
              padding: 2mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
            }
            
            .logo {
              height: 8mm;
              width: auto;
              margin-bottom: 1mm;
            }
            
            .ticket-number {
              font-size: 10px;
              font-weight: bold;
              color: #2563eb;
            }
            
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1mm;
              flex: 1;
            }
            
            .info-item {
              margin-bottom: 1mm;
            }
            
            .info-label {
              font-size: 6px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 0.5mm;
            }
            
            .info-value {
              font-size: 7px;
              font-weight: bold;
              word-break: break-word;
            }
            
            .problem-section {
              grid-column: 1 / -1;
              border-top: 1px solid #ccc;
              padding-top: 1mm;
              margin-top: 1mm;
            }
            
            .problem-description {
              font-size: 6px;
              line-height: 1.3;
              max-height: 8mm;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header">
              <img src="/logo.png" alt="Arregla.mx" class="logo" onerror="this.style.display='none'">
              <div class="ticket-number">TICKET #${ticket.numeroTicket}</div>
            </div>
            
            <div class="info-section">
              <div class="info-item">
                <div class="info-label">Cliente</div>
                <div class="info-value">${ticket.cliente ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno}` : 'No disponible'}</div>
              </div>
              
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
              
              <div class="problem-section">
                <div class="info-label">Descripción del Problema</div>
                <div class="problem-description">${ticket.descripcionProblema || 'No disponible'}</div>
              </div>
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
      onClick={handlePrintLabel}
      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      🏷️ Imprimir Etiqueta
    </button>
  );
}
