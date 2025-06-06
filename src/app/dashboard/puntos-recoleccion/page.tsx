import RouteGuard from '@/components/route-guard';

export default function PuntosRecoleccionPage() {
  return (
    <RouteGuard requiredPermissions={['COLLECTION_POINTS_VIEW']} section="Puntos de Recolección">
      <div className="container mx-auto py-6">
        {/* ... rest of the existing JSX ... */}
      </div>
    </RouteGuard>
  );
} 