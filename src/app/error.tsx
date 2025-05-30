'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#FEBF19] text-gray-900 rounded hover:bg-[#FEBF19]/90"
      >
        Intentar de nuevo
      </button>
    </div>
  );
} 