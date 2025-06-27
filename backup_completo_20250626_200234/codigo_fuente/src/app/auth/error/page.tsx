import RestrictedAccess from '@/components/restricted-access';

export default function AccessErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <RestrictedAccess section="Acceso Denegado" isErrorPage={true} />
    </div>
  );
} 