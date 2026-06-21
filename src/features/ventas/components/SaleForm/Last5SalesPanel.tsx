// src/features/ventas/components/SaleForm/Last5SalesPanel.tsx
"use client";

import { Loader2, Receipt, FileText } from "lucide-react";
import type { SaleList5last } from "../../types/saleForm.types";

interface Props {
  sales: SaleList5last[];
  loadingTicket: boolean;
  loadingA4: boolean;
  onPrintTicket: (venta: SaleList5last) => void;
  onPrintA4: (venta: SaleList5last) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
        {label}:{" "}
      </span>
      {value}
    </p>
  );
}

export function Last5SalesPanel({
  sales,
  loadingTicket,
  loadingA4,
  onPrintTicket,
  onPrintA4,
}: Props) {
  const anyLoading = loadingTicket || loadingA4;

  if (sales.length === 0) {
    return (
      <p className="text-xs text-center" style={{ color: "var(--su-text-muted)" }}>
        Sin ventas recientes
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sales.map((venta) => (
        <div key={String(venta.saleId)} className="su-surface rounded-2xl px-4 py-3 flex flex-col gap-1.5">

          {/* Número de venta */}
          <p className="text-sm font-bold truncate" style={{ color: "var(--su-text)" }}>
            {venta.saleNumber}
          </p>
          <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
            {new Date(venta.issueDate).toLocaleDateString("es-EC", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>

          <div className="su-divider my-0.5" />

          {/* Info rows */}
          <div className="flex flex-col gap-0.5">
            <InfoRow label="Total" value={`$${Number(venta.totalAmount).toFixed(2)}`} />
            {venta.items.slice(0, 2).map((item, i) => (
              <InfoRow
                key={i}
                label={`(${item.quantity}) ${item.productName}`}
                value={`$${Number(item.unitPrice).toFixed(2)}`}
              />
            ))}
            {venta.items.length > 2 && (
              <p className="text-[11px]" style={{ color: "var(--su-text-subtle)" }}>
                + {venta.items.length - 2} más…
              </p>
            )}
          </div>

          <div className="su-divider my-0.5" />

          {/* Botones */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPrintTicket(venta)}
              disabled={anyLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl
                         su-icon-btn text-xs font-semibold disabled:opacity-50 transition-all"
            >
              {loadingTicket
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Receipt className="w-3 h-3" />}
              Ticket
            </button>

            <button
              type="button"
              onClick={() => onPrintA4(venta)}
              disabled={anyLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl
                         su-icon-btn text-xs font-semibold disabled:opacity-50 transition-all"
            >
              {loadingA4
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <FileText className="w-3 h-3" />}
              A4
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}