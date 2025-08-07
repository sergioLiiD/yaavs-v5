'use client';

import React, { useState } from 'react';
import VentaProductosForm from './VentaProductosForm';
import VentasTable from './VentasTable';
import ReciboModal from './ReciboModal';

export default function VentaProductosPageContent() {
  const [showForm, setShowForm] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<any>(null);
  const [showReciboModal, setShowReciboModal] = useState(false);

  const handleNuevaVenta = () => {
    setShowForm(true);
  };

  const handleVolverATabla = () => {
    setShowForm(false);
  };

  const handleVerDetalle = (venta: any) => {
    setSelectedVenta(venta);
    setShowReciboModal(true);
  };

  const handleCerrarModal = () => {
    setShowReciboModal(false);
    setSelectedVenta(null);
  };

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleVolverATabla}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            ← Volver al Historial
          </button>
        </div>
        <VentaProductosForm />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <VentasTable 
        onNuevaVenta={handleNuevaVenta}
        onVerDetalle={handleVerDetalle}
      />

      {/* Modal del recibo */}
      {selectedVenta && (
        <ReciboModal
          venta={selectedVenta}
          isOpen={showReciboModal}
          onClose={handleCerrarModal}
          onNuevaVenta={() => {
            setShowReciboModal(false);
            setSelectedVenta(null);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
} 