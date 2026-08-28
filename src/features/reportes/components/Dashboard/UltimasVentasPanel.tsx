// src/features/reportes/components/Dashboard/UltimasVentasPanel.tsx
"use client";

import { useState } from "react";
import { Loader2, Receipt, FileText } from "lucide-react";
import { toast } from "sonner";
import { saleApi } from "@/features/ventas/api/sale.api";
import type { SaleList5last } from "@/features/ventas/types/saleForm.types";

interface Props {
  ventas: SaleList5last[];
}

export function UltimasVentasPanel({ ventas }: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handlePrint = async (venta: SaleList5last, tipo: "ticket" | "a4") => {
    const key = `${venta.saleId}-${tipo}`;
    setLoadingKey(key);
    try {
      if (tipo === "ticket") {
        await saleApi.printTicketPDF({ id: venta.saleId });
      } else {
        await saleApi.printA4PDF({ id: venta.saleId });
      }
    } catch {
      toast.error(`Error al imprimir ${tipo === "ticket" ? "ticket" : "A4"}`);
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="su-field-label">Últimas ventas</h2>

      {ventas.length === 0 ? (
        <div className="su-surface-md rounded-3xl p-5">
          <p className="text-xs text-center" style={{ color: "var(--su-text-muted)" }}>
            Sin ventas recientes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ventas.map((venta) => {
            const loadingTicket = loadingKey === `${venta.saleId}-ticket`;
            const loadingA4 = loadingKey === `${venta.saleId}-a4`;
            const anyLoading = loadingKey !== null;

            return (
              <div
                key={String(venta.saleId)}
                className="su-surface-md rounded-3xl p-4 flex flex-col gap-2"
              >
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

                <p className="text-lg font-bold" style={{ color: "var(--su-text)" }}>
                  ${Number(venta.totalAmount).toFixed(2)}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--su-text-muted)" }}>
                  {venta.items.length} producto{venta.items.length !== 1 ? "s" : ""}
                </p>

                <div className="su-divider my-0.5" />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrint(venta, "ticket")}
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
                    onClick={() => handlePrint(venta, "a4")}
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
            );
          })}
        </div>
      )}
    </section>
  );
}