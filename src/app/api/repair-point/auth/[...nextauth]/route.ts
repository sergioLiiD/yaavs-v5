import NextAuth from 'next-auth';
import { authOptionsRepairPoint } from '@/lib/auth-repair-point';

const handler = NextAuth(authOptionsRepairPoint);

export { handler as GET, handler as POST }; 