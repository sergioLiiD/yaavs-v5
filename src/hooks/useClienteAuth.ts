import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Cliente {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  email: string;
  telefonoCelular: string;
  telefonoContacto: string | null;
  calle: string | null;
  numeroExterior: string | null;
  numeroInterior: string | null;
  colonia: string | null;
  ciudad: string | null;
  estado: string | null;
  codigoPostal: string | null;
  latitud: number | null;
  longitud: number | null;
  fuenteReferencia: string | null;
  rfc: string | null;
  tipoRegistro: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function useClienteAuth() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceCheck, setForceCheck] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // No verificar en rutas públicas
        if (pathname === '/cliente/login' || pathname === '/cliente/registro') {
          if (isMounted) {
            setCliente(null);
            setLoading(false);
          }
          return;
        }

        console.log('Verificando autenticación...');
        const response = await fetch('/api/cliente/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('No autorizado');
        }

        const data = await response.json();
        console.log('Datos del cliente:', data);

        if (isMounted) {
          setCliente(data.cliente);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        if (isMounted) {
          setCliente(null);
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, forceCheck]);

  const logout = async () => {
    try {
      // Limpiar el estado inmediatamente
      setCliente(null);
      setLoading(true);
      
      // Llamar a la API de logout
      await fetch('/api/cliente/logout', { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // También eliminar la cookie del lado del cliente como respaldo
      document.cookie = 'cliente_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'cliente_token=; path=/cliente; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Forzar nueva verificación
      setForceCheck(prev => prev + 1);
      
      // Redirigir al login
      router.push('/cliente/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, limpiar el estado y redirigir
      setCliente(null);
      setLoading(false);
      document.cookie = 'cliente_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'cliente_token=; path=/cliente; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setForceCheck(prev => prev + 1);
      router.push('/cliente/login');
    }
  };

  return {
    cliente,
    loading,
    logout,
    isAuthenticated: !!cliente,
  };
} 