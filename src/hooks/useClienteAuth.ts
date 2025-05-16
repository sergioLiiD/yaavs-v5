import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cliente } from '@/types/cliente';

interface UseClienteAuthReturn {
  cliente: Cliente | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useClienteAuth(): UseClienteAuthReturn {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/cliente/me', {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            setCliente(null);
          } else {
            throw new Error('Error al verificar la sesión');
          }
        } else {
          const data = await response.json();
          setCliente(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al verificar la sesión');
        setCliente(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    cliente,
    loading,
    error,
    isAuthenticated: !!cliente
  };
} 