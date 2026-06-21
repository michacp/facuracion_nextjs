// src/features/reportes/components/Dashboard/KpiGrid.tsx
"use client";

import { KpiPeriodo, KpisResponse } from "@/features/reportes/types/reportes.types";

import { fmt  } from "./utils/format";

function KpiCard({ label, kpi }: { label: string; kpi: KpiPeriodo }) {
  return (
    <div className="su-surface-md rounded-3xl p-5 flex flex-col gap-3">
      <p className="su-field-label">{label}</p>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
           style={{ color: "var(--su-text-muted)" }}>
          Ventas
        </p>
        <p className="text-2xl font-bold" style={{ color: "var(--su-text)" }}>
          {fmt(kpi.ventas_total)}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
          {kpi.ventas_count} transacciones
        </p>
      </div>

      <div className="su-divider" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
             style={{ color: "var(--su-text-muted)" }}>
            Compras
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
            {fmt(kpi.compras_total)}
          </p>
          <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
            {kpi.compras_count} órdenes
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
             style={{ color: "var(--su-text-muted)" }}>
            Utilidad
          </p>
          <p className="text-sm font-bold text-emerald-500">
            {fmt(kpi.utilidad_bruta)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  kpis: KpisResponse;
  onRefetch: () => void;
}

export function KpiGrid({ kpis, onRefetch }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="su-field-label">Resumen financiero</h2>
        <button
          onClick={onRefetch}
          className="su-icon-btn rounded-2xl px-4 py-2 text-xs font-semibold gap-2 flex items-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Esta semana" kpi={kpis.semana} />
        <KpiCard label="Este mes"    kpi={kpis.mes}    />
        <KpiCard label="Este año"    kpi={kpis.anio}   />
      </div>
    </section>
  );
}