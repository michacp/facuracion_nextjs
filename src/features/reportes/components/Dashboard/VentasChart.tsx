// src/features/reportes/components/Dashboard/VentasChart.tsx
"use client";

import { VentaSemana } from "@/features/reportes/types/reportes.types";
import {  fmtK } from "./utils/format";

interface Props {
  semanas: VentaSemana[];
}

const CHART_H = 120; // px fijos — nunca usar % en barras dentro de flex

export function VentasChart({ semanas }: Props) {
  if (semanas.length === 0) return null;

  const max = Math.max(...semanas.map((s) => s.total_ventas), 1);

  return (
    <div className="su-surface-md rounded-3xl p-5 flex flex-col gap-3 h-full">
      <h2 className="su-field-label">Ventas por semana</h2>

      {/* Barras — altura calculada en px absolutos */}
      <div
        className="flex items-end gap-[5px] w-full"
        style={{ height: `${CHART_H}px` }}
      >
        {semanas.map((s, i) => {
          const barH = Math.max(Math.round((s.total_ventas / max) * CHART_H), 4);
          return (
            <div
              key={s.label}
              className="flex flex-1 flex-col items-center justify-end h-full gap-1"
            >
              <span
                className="text-[9px] leading-none text-center"
                style={{ color: "var(--su-text-muted)" }}
              >
                {fmtK(s.total_ventas)}
              </span>
              <div
                style={{
                  width: "8px",
                  height: `${barH}px`,
                  background: "linear-gradient(180deg, var(--brand-indigo), var(--brand-purple))",
                  boxShadow: "var(--su-shadow-brand)",
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.6s cubic-bezier(.34,1.4,.64,1)",
                  transitionDelay: `${i * 40}ms`,
                }}
                title={`${s.label}: $${s.total_ventas.toLocaleString("es-EC")}`}
              />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex gap-[5px]">
        {semanas.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--su-text-subtle)" }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}