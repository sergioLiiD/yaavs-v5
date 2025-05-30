import axios from 'axios';
import { getSession } from 'next-auth/react';

// Crear una instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Habilitar el envío de cookies
});

// Interceptor para agregar el token de autenticación
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user) {
      // NextAuth maneja la autenticación a través de cookies
      // No necesitamos agregar el token manualmente
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si el token expiró
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 