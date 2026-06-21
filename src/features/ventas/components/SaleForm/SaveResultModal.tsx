// src/features/ventas/components/SaleForm/SaveResultModal.tsx
"use client";

import { X, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import type { SaveSaleResult } from "../../types/saleForm.types";

interface Props {
  result: SaveSaleResult;
  onClose: () => void;
}

export function SaveResultModal({ result, onClose }: Props) {
  const Icon = result.success
    ? CheckCircle2
    : result.title.includes("⏳")
    ? Clock
    : result.title.includes("⚠️")
    ? AlertTriangle
    : XCircle;

  const colorClass = result.success
    ? "text-emerald-500"
    : result.title.includes("⚠️")
    ? "text-amber-500"
    : result.title.includes("⏳")
    ? "text-sky-500"
    : "text-red-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="su-surface-lg rounded-2xl p-8 max-w-sm w-full mx-4 relative animate-[float-in_0.35s_cubic-bezier(0.34,1.4,0.64,1)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 su-icon-btn"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <Icon className={`w-14 h-14 ${colorClass}`} />
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
              {result.title}
            </h3>
            <p className="text-sm text-[var(--su-text-muted)]">{result.message}</p>
            {result.ventaId && (
              <p className="mt-2 text-xs text-[var(--su-text-subtle)]">
                ID de venta: <span className="font-mono font-bold">{String(result.ventaId)}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="su-brand px-6 py-2 rounded-xl text-sm font-bold mt-2"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}