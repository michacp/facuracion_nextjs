// src/app/(dashboard)/page.tsx
import { EmpresaProfile } from "@/features/empresa/components/EmpresaProfile";  
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <EmpresaProfile />
    </main>
  );
}