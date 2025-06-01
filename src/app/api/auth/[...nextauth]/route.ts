import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('Configurando NextAuth con opciones:', {
  secret: process.env.NEXTAUTH_SECRET ? 'Definido' : 'No definido',
  url: process.env.NEXTAUTH_URL,
  database: process.env.DATABASE_URL
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 