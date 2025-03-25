import AdminLayout from '@/components/layout/AdminLayout';

export default function InventarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout title="Inventario">
      {children}
    </AdminLayout>
  );
} 