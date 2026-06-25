// src/app/(dashboard)/page.tsx
import { CuentasPorPagar } from "@/features/reportes/components/CuentasPorPagar";
export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background transition-colors duration-200"> 

      {/* El componente inteligente vive en features/ */}
      <CuentasPorPagar />
    </main>
  );
}