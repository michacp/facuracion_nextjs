import { ArrowUpRight, Boxes, DollarSign, ShoppingBag, Users } from "lucide-react";

export default function DashboardPage() {
  // Data simulada rápida para rellenar el diseño de pruebas
  const cards = [
    { title: "Ventas del Día", value: "$1,245.00", icon: DollarSign, trend: "+12%" },
    { title: "Órdenes Nuevas", value: "24", icon: ShoppingBag, trend: "+5%" },
    { title: "Productos en Stock", value: "3,420", icon: Boxes, trend: "Estable" },
    { title: "Clientes Activos", value: "182", icon: Users, trend: "+8%" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Panel General
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bienvenido de vuelta. Aquí está el resumen de tu negocio multi-tenant para hoy.
        </p>
      </div>

      {/* Grid de Reportes Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.title}</span>
                <div className="w-8 h-8 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded flex items-center gap-0.5">
                  {card.trend}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}