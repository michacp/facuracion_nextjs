// src/features/reportes/components/Dashboard/StockBajoTable.tsx
"use client";

import { StockBajoResponse } from "@/features/reportes/types/reportes.types";

interface Props {
  stockBajo: StockBajoResponse;
}

export function StockBajoTable({ stockBajo }: Props) {
  if (stockBajo.total === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="su-field-label">Stock bajo ({stockBajo.total} productos)</h2>
      <div className="su-surface-md rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--su-border-strong)" }}>
              {["Código", "Producto", "Stock", "Umbral"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${
                    i === 0 ? "text-left" : i === 1 ? "text-left" : "text-right"
                  }`}
                  style={{ color: "var(--su-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stockBajo.items.map((p) => (
              <tr
                key={p.item_id}
                className="transition-colors"
                style={{ borderTop: "1px solid var(--su-border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--su-bg-deep)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td className="px-4 py-3 font-mono text-[11px]"
                    style={{ color: "var(--su-text-muted)" }}>
                  {p.codigo}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>
                  {p.nombre}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-500">
                  {p.stock_total}
                </td>
                <td className="px-4 py-3 text-right text-sm" style={{ color: "var(--su-text-muted)" }}>
                  {p.umbral}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}