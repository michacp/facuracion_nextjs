// src/features/ventas/components/SaleForm/TotalesPanel.tsx
"use client";

import { UseFormReturn } from "react-hook-form";
import type { FacturaFormValues } from "../../types/saleForm.types";

interface Campo {
  label: string;
  control: keyof Pick<
    FacturaFormValues,
    "subtotal" | "descuentoTotal" | "iva" | "propina" | "total"
  >;
  highlight?: boolean;
}

const CAMPOS: Campo[] = [
  { label: "Subtotal", control: "subtotal" },
  { label: "Descuento Total", control: "descuentoTotal" },
  { label: "IVA", control: "iva" },
  { label: "Propina", control: "propina" },
  { label: "Total", control: "total", highlight: true },
];

interface Props {
  form: UseFormReturn<FacturaFormValues>;
}

export function TotalesPanel({ form }: Props) {
  const values = form.watch(["subtotal", "descuentoTotal", "iva", "propina", "total"]);
  const map: Record<string, number> = {
    subtotal: values[0],
    descuentoTotal: values[1],
    iva: values[2],
    propina: values[3],
    total: values[4],
  };

  return (
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      {CAMPOS.map((campo) => (
        <div
          key={campo.control}
          className={`rounded-xl px-4 py-3 min-w-[130px] text-right ${
            campo.highlight
              ? "su-brand"
              : "su-surface"
          }`}
        >
          <p
            className={`text-[10px] uppercase tracking-widest font-bold mb-0.5 ${
              campo.highlight ? "text-white/70" : "text-[var(--su-text-muted)]"
            }`}
          >
            {campo.label}
          </p>
          <p
            className={`text-lg font-bold tabular-nums ${
              campo.highlight ? "text-white" : "text-[var(--foreground)]"
            }`}
          >
            ${(map[campo.control] ?? 0).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}