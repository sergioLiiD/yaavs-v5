'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: false,
    onUnauthenticated() {
      // No hacer nada, el usuario no está autenticado
    }
  });
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('User is authenticated, redirecting to:', callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

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
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Error durante el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBF19] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="Logo de la empresa" 
            className="h-48 w-auto"
            onError={(e) => {
              // Fallback si no hay logo
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }} 
          />
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            Sistema de Reparación de Celulares
          </h1>
          <h2 className="text-sm text-center text-gray-500 mb-5">
            Inicia sesión para continuar
          </h2>
          
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#FEBF19] focus:border-[#FEBF19] block w-full p-2.5"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#FEBF19] focus:border-[#FEBF19] block w-full p-2.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-[#FEBF19] bg-gray-100 border-gray-300 rounded focus:ring-[#FEBF19]"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900">
                  Recordarme
                </label>
              </div>
              <Link href="/auth/recuperar-password" className="text-sm text-[#FEBF19] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
        
        <div className="mt-5 text-center text-xs text-gray-500">
          <p>© 2023 Sistema de Reparación de Celulares - YAAVS</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FEBF19] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 