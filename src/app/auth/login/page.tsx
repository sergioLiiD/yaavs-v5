'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sistema de Reparación de Celulares</h1>
        
        <h2 className="text-xl font-semibold mb-6 text-center">Iniciar sesión</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            ¿Olvidaste tu contraseña?{' '}
            <Link href="/auth/recuperar-password" className="text-blue-500 hover:underline">
              Recuperar contraseña
            </Link>
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>© 2023 Sistema de Reparación de Celulares - YAAVS</p>
        </div>
      </div>
    </div>
  );
} 