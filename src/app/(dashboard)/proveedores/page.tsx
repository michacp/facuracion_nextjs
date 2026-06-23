// src/app/(dashboard)/page.tsx
import { ProveedoresList } from "@/features/proveedores/components/ProveedoresList";
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <ProveedoresList />
    </main>
  );
}