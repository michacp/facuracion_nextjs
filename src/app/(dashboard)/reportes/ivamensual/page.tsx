// src/app/(dashboard)/page.tsx
import { IvaMensual } from "@/features/reportes/components/IvaMensual";
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <IvaMensual />
    </main>
  );
}