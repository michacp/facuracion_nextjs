// src/features/reportes/components/Dashboard/index.tsx
"use client";

import { useDashboard } from "@/features/reportes/hooks/useDashboard";
import { KpiGrid }           from "./KpiGrid";
import { VentasChart }       from "./VentasChart";
import { AlertasPanel }      from "./AlertasPanel";
import { StockBajoTable }    from "./StockBajoTable";
import { TopProductosTable } from "./TopProductosTable";
import { TopClientesTable }  from "./TopClientesTable";

// ─── Estados de carga / error ────────────────────────────────────────────────

function DashboardLoading() {
  return (
    <div className="flex h-64 items-center justify-center gap-3">
      <div
        className="w-5 h-5 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }}
      />
      <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
        Cargando panel…
      </span>
    </div>
  );
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-sm text-red-500">No se pudo cargar el panel.</p>
      <button onClick={onRetry} className="su-brand px-5 py-2 rounded-2xl text-sm font-semibold">
        Reintentar
      </button>
    </div>
  );
}

// ─── Orquestador ─────────────────────────────────────────────────────────────

export function Dashboard() {
  const { data, isLoading, error, refetch, periodoTop, setPeriodoTop } = useDashboard();

  if (isLoading) return <DashboardLoading />;
  if (error)     return <DashboardError onRetry={refetch} />;
  if (!data)     return null;

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <KpiGrid kpis={data.kpis} onRefetch={refetch} />

      {/* ── Gráfico (izq) + Alertas apiladas (der) ────────────────────────── */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <VentasChart semanas={data.ventasSemanas.semanas} />
          <AlertasPanel alertas={data.alertas} />
        </div>
      </section>

      {/* ── Stock bajo ────────────────────────────────────────────────────── */}
      <StockBajoTable stockBajo={data.stockBajo} />

      {/* ── Selector de período ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em] mr-1"
          style={{ color: "var(--su-text-subtle)" }}
        >
          Período:
        </span>
        {(["semana", "mes", "anio"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodoTop(p)}
            className="px-4 py-1.5 rounded-2xl text-xs font-semibold transition-all duration-200"
            style={
              periodoTop === p
                ? {
                    background: "linear-gradient(135deg, var(--brand-indigo), var(--brand-purple))",
                    boxShadow: "var(--su-shadow-brand)",
                    color: "white",
                  }
                : {
                    background: "var(--su-bg)",
                    boxShadow: "var(--su-shadow-sm)",
                    border: "1px solid var(--su-border)",
                    color: "var(--su-text-muted)",
                  }
            }
          >
            {p === "anio" ? "Año" : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Top productos + Top clientes ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProductosTable topProductos={data.topProductos} />
        <TopClientesTable  topClientes={data.topClientes}  />
      </div>

    </div>
  );
}