'use client';

import { PresupuestoIndependienteCompleto } from '@/types/presupuesto-independiente';
import { useEffect, useRef } from 'react';

interface PresupuestoPrintProps {
  presupuesto: PresupuestoIndependienteCompleto;
  onClose: () => void;
}

export default function PresupuestoPrint({ presupuesto, onClose }: PresupuestoPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePrint = () => {
      if (printRef.current) {
        window.print();
      }
    };

    // Imprimir automáticamente cuando se monta el componente
    handlePrint();

    // Cerrar el modal después de imprimir
    const handleAfterPrint = () => {
      setTimeout(() => {
        onClose();
      }, 100);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    return presupuesto.productos_presupuesto_independiente.reduce((total, producto) => {
      return total + calcularSubtotal(producto);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Vista previa de impresión</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div ref={printRef} className="print-content bg-white p-8">
          {/* Header con logo */}
          <div className="flex justify-between items-start mb-8 border-b pb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Arregla.mx</h1>
                <p className="text-gray-600">Servicios de reparación</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600">PRESUPUESTO</h2>
              <p className="text-sm text-gray-600">Fecha: {formatDate(presupuesto.created_at)}</p>
              <p className="text-sm text-gray-600">Presupuesto #: {presupuesto.id}</p>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cliente:</p>
                <p className="font-medium">{presupuesto.cliente_nombre || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Elaborado por:</p>
                <p className="font-medium">{formatUserName(presupuesto.usuarios)}</p>
              </div>
            </div>
            {presupuesto.descripcion && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Descripción:</p>
                <p className="text-sm">{presupuesto.descripcion}</p>
              </div>
            )}
          </div>

          {/* Tabla de productos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Detalle de Productos y Servicios</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Producto/Servicio</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Cantidad</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">Precio Unit.</th>
                  <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">Subtotal</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Concepto Extra</th>
                </tr>
              </thead>
              <tbody>
                {presupuesto.productos_presupuesto_independiente.map((producto, index) => (
                  <tr key={producto.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2">
                      <div>
                        <div className="font-medium">
                          {producto.productos?.nombre || 'Producto no encontrado'}
                        </div>
                        {producto.productos?.sku && (
                          <div className="text-xs text-gray-500">
                            SKU: {producto.productos.sku}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {producto.cantidad}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ${producto.precio_venta.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      <div>
                        <div className="font-medium">
                          ${(producto.precio_venta * producto.cantidad).toFixed(2)}
                        </div>
                        {producto.precio_concepto_extra && producto.precio_concepto_extra > 0 && (
                          <div className="text-xs text-gray-500">
                            +${producto.precio_concepto_extra.toFixed(2)} extra
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {producto.concepto_extra ? (
                        <div>
                          <div className="text-xs">{producto.concepto_extra}</div>
                          {producto.precio_concepto_extra && producto.precio_concepto_extra > 0 && (
                            <div className="text-xs text-green-600">
                              +${producto.precio_concepto_extra.toFixed(2)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="border-t-2 border-gray-300 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-6 text-center text-sm text-gray-600">
            <p>Este presupuesto es válido por 15 días desde la fecha de emisión.</p>
            <p className="mt-2">Para cualquier consulta, contacte a nuestro equipo de servicio al cliente.</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
