// src/app/(dashboard)/page.tsx
import { MiPerfil } from "@/features/empresa/components/MiPerfil";  
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <MiPerfil />
    </main>
  );
}