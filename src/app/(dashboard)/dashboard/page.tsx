// src/app/(dashboard)/page.tsx
import { Dashboard } from "@/features/reportes/components/Dashboard";  
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <Dashboard />
    </main>
  );
}