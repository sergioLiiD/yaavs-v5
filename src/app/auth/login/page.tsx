'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    console.log('Login page loaded');
    console.log('Session status:', status);
    console.log('Current session:', session);
    
    if (status === 'authenticated') {
      console.log('User is authenticated, redirecting to:', callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Attempting to sign in with:', { email });
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        setError('Credenciales inválidas');
        setIsLoading(false);
      } else if (result?.ok) {
        console.log('Authentication successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Error durante el inicio de sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="YAAVS Logo" 
            className="h-12"
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember" className="ml-2 text-sm font-medium text-gray-900">
                  Recordarme
                </label>
              </div>
              <Link href="/auth/recuperar-password" className="text-sm text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
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
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
} 