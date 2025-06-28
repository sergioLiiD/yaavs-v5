'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Agregar un pequeño delay para asegurar que la sesión esté completamente establecida
      const redirectTimeout = setTimeout(() => {
        let redirectUrl = '/dashboard';
        
        // Si hay un callbackUrl específico y es válido, usarlo
        if (callbackUrl && callbackUrl.startsWith('/')) {
          redirectUrl = callbackUrl;
        }

        // Asegurarse de que la URL sea válida antes de redirigir
        try {
          // Si la URL no es absoluta, hacerla absoluta
          if (!redirectUrl.startsWith('http') && !redirectUrl.startsWith('/')) {
            redirectUrl = '/' + redirectUrl;
          }
          
          // Validar que la URL sea válida
          if (redirectUrl.startsWith('/')) {
            console.log('Redirigiendo a:', redirectUrl);
            router.replace(redirectUrl);
          } else {
            console.error('URL inválida:', redirectUrl);
            router.replace('/dashboard');
          }
        } catch (error) {
          console.error('Error con URL:', redirectUrl, error);
          router.replace('/dashboard');
        }
      }, 100); // Pequeño delay de 100ms

      return () => clearTimeout(redirectTimeout);
    }
  }, [status, session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Iniciando proceso de login...');
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl
      });

      console.log('Resultado del signIn:', result);

      if (result?.error) {
        console.log('Error en credenciales:', result.error);
        setError('Credenciales inválidas');
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('Login exitoso, actualizando sesión...');
        setShouldRedirect(true);
        
        // Forzar la actualización de la sesión
        try {
          await update();
          console.log('Sesión actualizada manualmente');
          
          // También intentar obtener la sesión directamente
          const newSession = await getSession();
          console.log('Nueva sesión obtenida:', newSession ? 'Sí' : 'No');
        } catch (updateError) {
          console.error('Error actualizando sesión:', updateError);
        }
        
        // No llamamos setIsLoading(false) aquí para mantener el estado de loading
        // hasta que la redirección ocurra
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError('Error durante el inicio de sesión');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    );
  }

  if (status === 'authenticated' && session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#FEBF19] focus:border-[#FEBF19] focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#FEBF19] focus:border-[#FEBF19] focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#FEBF19] hover:bg-[#E5A800] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  {shouldRedirect ? 'Redirigiendo...' : 'Iniciando sesión...'}
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FEBF19]"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}