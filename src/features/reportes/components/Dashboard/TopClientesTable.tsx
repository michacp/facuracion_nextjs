// src/features/reportes/components/Dashboard/TopClientesTable.tsx
"use client";

import { TopClientesResponse } from "@/features/reportes/types/reportes.types";
import { fmt  } from "./utils/format";

interface Props {
  topClientes: TopClientesResponse;
}

export function TopClientesTable({ topClientes }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="su-field-label">Top clientes</h2>
      <div className="su-surface-md rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--su-border-strong)" }}>
              {["Cliente", "Compras", "Facturado"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                  style={{ color: "var(--su-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topClientes.clientes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm"
                    style={{ color: "var(--su-text-muted)" }}>
                  Sin datos para este período
                </td>
              </tr>
            ) : (
              topClientes.clientes.map((c) => (
                <tr
                  key={c.cliente_id}
                  className="transition-colors"
                  style={{ borderTop: "1px solid var(--su-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--su-bg-deep)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>
                    {c.razon_social}
                  </td>
                  <td className="px-4 py-3 text-right text-sm" style={{ color: "var(--su-text-muted)" }}>
                    {c.total_compras}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold"
                      style={{ color: "var(--su-text)" }}>
                    {fmt(c.total_facturado)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}