'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session && !isLoading) {
      // Todos los usuarios van al dashboard principal
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
          router.replace(redirectUrl);
        } else {
          console.error('URL inválida:', redirectUrl);
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Error con URL:', redirectUrl, error);
        router.replace('/dashboard');
      }
    }
  }, [status, session, router, callbackUrl, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl
      });

      if (result?.error) {
        setError('Credenciales inválidas');
      }
      // No redirigimos aquí, dejamos que el useEffect se encargue
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError('Error durante el inicio de sesión');
    } finally {
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
    return null;
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
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
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