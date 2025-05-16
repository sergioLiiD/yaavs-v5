import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
      <p className="mb-4">Lo sentimos, la página que buscas no existe.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Volver al inicio
      </Link>
    </div>
  );
} 