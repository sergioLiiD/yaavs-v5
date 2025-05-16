'use client';

export default function Error500() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Error del servidor</h2>
      <p className="mb-4">Lo sentimos, ha ocurrido un error en el servidor.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Recargar página
      </button>
    </main>
  );
} 