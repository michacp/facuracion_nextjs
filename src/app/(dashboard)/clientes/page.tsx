// src/app/(dashboard)/page.tsx
import { ClientesList } from "@/features/clientes/components/ClientesList";  
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <ClientesList />
    </main>
  );
}