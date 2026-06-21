// src/features/reportes/components/Dashboard/AlertasPanel.tsx
"use client";

import { AlertasResponse } from "@/features/reportes/types/reportes.types";

import { fmt, fmtK } from "./utils/format";

type AlertColor = "yellow" | "red" | "orange";

const colorMap: Record<AlertColor, { border: string; bg: string; title: string }> = {
  yellow: { border: "rgba(234,179,8,0.35)",   bg: "rgba(234,179,8,0.05)",   title: "#ca8a04" },
  red:    { border: "rgba(239,68,68,0.35)",    bg: "rgba(239,68,68,0.05)",   title: "#dc2626" },
  orange: { border: "rgba(249,115,22,0.35)",   bg: "rgba(249,115,22,0.05)",  title: "#ea580c" },
};

function AlertCard({
  color,
  title,
  children,
}: {
  color: AlertColor;
  title: string;
  children: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div
      className="rounded-2xl p-3 space-y-1.5"
      style={{ border: `1px solid ${c.border}`, background: c.bg }}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: c.title }}>
        {title}
      </p>
      {children}
    </div>
  );
}

interface Props {
  alertas: AlertasResponse;
}

export function AlertasPanel({ alertas }: Props) {
  if (alertas.total_alertas === 0) return null;

  return (
    <div className="flex flex-col gap-2 h-full">
      <h2 className="su-field-label">Alertas ({alertas.total_alertas})</h2>

      {alertas.firmas_por_vencer.length > 0 && (
        <AlertCard color="yellow" title="Firmas por vencer">
          {alertas.firmas_por_vencer.map((f) => (
            <div key={f.firmas_id} className="flex justify-between items-center">
              <span className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
                {f.alias}
              </span>
              <span className="text-[11px] font-bold" style={{ color: colorMap.yellow.title }}>
                {f.dias_restantes}d
              </span>
            </div>
          ))}
        </AlertCard>
      )}

      {alertas.facturas_pendientes.length > 0 && (
        <AlertCard color="red" title="Facturas SRI pendientes">
          {alertas.facturas_pendientes.map((f) => (
            <p key={f.factura_id} className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
              {f.numero_venta}
            </p>
          ))}
        </AlertCard>
      )}

      {alertas.compras_por_pagar.length > 0 && (
        <AlertCard color="orange" title="Compras por pagar">
          {alertas.compras_por_pagar.map((c) => (
            <div key={c.compra_id} className="flex justify-between items-center gap-2">
              <span className="text-[11px] truncate" style={{ color: "var(--su-text-muted)" }}>
                {c.proveedor}
              </span>
              <span className="text-[11px] font-bold shrink-0" style={{ color: colorMap.orange.title }}>
                {fmt(c.saldo_pendiente)}
              </span>
            </div>
          ))}
        </AlertCard>
      )}
    </div>
  );
}