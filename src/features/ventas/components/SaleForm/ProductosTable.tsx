// src/features/ventas/components/SaleForm/ProductosTable.tsx
"use client";

import { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import { Trash2, ShoppingCart } from "lucide-react";
import type { FacturaFormValues, ImpuestoSales, ProductoUI } from "../../types/saleForm.types";

interface Props {
  form: UseFormReturn<FacturaFormValues>;
  fields: FieldArrayWithId<FacturaFormValues, "productos", "id">[];
  productosUI: ProductoUI[];
  impuestos: ImpuestoSales[];
  onEliminar: (index: number) => void;
  onCambio: () => void;
}

export function ProductosTable({
  form,
  fields,
  productosUI,
  impuestos,
  onEliminar,
  onCambio,
}: Props) {
  const { register } = form;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--su-border)]">
      {/* Se cambió a text-xs para que toda la letra de la tabla sea más pequeña */}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[var(--su-bg-deep)] text-[var(--su-text-muted)] uppercase tracking-wider">
            {/* Se redujo el padding de py-3 a py-2 y se ajustaron los px */}
            <th className="px-3 py-2 text-left font-semibold">Producto</th>
            <th className="px-2 py-2 text-center font-semibold w-20">Cantidad</th>
            <th className="px-2 py-2 text-center font-semibold w-24">Precio U.</th>
            <th className="px-2 py-2 text-center font-semibold w-24">Descuento</th>
            <th className="px-2 py-2 text-center font-semibold w-32">IVA</th>
            <th className="px-2 py-2 text-center font-semibold w-12"></th>
          </tr>
        </thead>
        <tbody>
          {fields.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-[var(--su-text-muted)]">
                <div className="flex flex-col items-center gap-2">
                  <ShoppingCart className="w-6 h-6 opacity-30" />
                  <span className="text-xs">Agrega productos o servicios a la venta</span>
                </div>
              </td>
            </tr>
          ) : (
            fields.map((field, index) => (
              <tr
                key={field.id}
                className="border-t border-[var(--su-border)] hover:bg-[var(--su-bg-deep)] transition-colors"
              >
                {/* Nombre + badge */}
{/* Nombre + badge + IMEIs */}
                <td className="px-3 py-1.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">
                        {productosUI[index]?.nombre ?? "—"}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                          productosUI[index]?.esServicio
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {productosUI[index]?.esServicio ? "Servicio" : "Producto"}
                      </span>
                    </div>
{productosUI[index]?.requireImei && productosUI[index]?.imeisDisplay && (
  <span className="text-[10px] text-[var(--su-text-muted)]">
    IMEI{productosUI[index]!.imeisDisplay!.length > 1 ? "s" : ""}:{" "}
    {productosUI[index]!.imeisDisplay!.map((imei) => `#${imei}`).join(" / ")}
  </span>
)}
                  </div>
                </td>

                {/* Cantidad */}
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={1}
                    disabled={!!productosUI[index]?.requireImei}
                    {...register(`productos.${index}.cantidad`, {
                      valueAsNumber: true,
                      onChange: onCambio,
                    })}
                    onFocus={(e) => e.target.select()}
                    className="su-inset w-full rounded-md px-1.5 py-1 text-center text-xs
                               focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30
                               disabled:opacity-60"
                  />
                </td>

                {/* Cantidad */}
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={1}
                    {...register(`productos.${index}.cantidad`, {
                      valueAsNumber: true,
                      onChange: onCambio,
                    })}
                    onFocus={(e) => e.target.select()}
                    className="su-inset w-full rounded-md px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  />
                </td>

                {/* Precio */}
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    step="0.01"
                    {...register(`productos.${index}.precioUnitario`, {
                      valueAsNumber: true,
                      onChange: onCambio,
                    })}
                    onFocus={(e) => e.target.select()}
                    className="su-inset w-full rounded-md px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  />
                </td>

                {/* Descuento */}
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`productos.${index}.descuento`, {
                      valueAsNumber: true,
                      onChange: onCambio,
                    })}
                    onFocus={(e) => e.target.select()}
                    className="su-inset w-full rounded-md px-1.5 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  />
                </td>

                {/* IVA Select */}
                <td className="px-2 py-1.5">
                  <select
                    {...register(`productos.${index}.codigoImpuesto`, {
                      onChange: onCambio,
                    })}
                    // Select más pequeño
                    className="su-inset w-full rounded-md px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  >
                    {impuestos.map((imp) => (
                      <option key={String(imp.id)} value={String(imp.id)}>
                        {imp.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Eliminar */}
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => onEliminar(index)}
                    className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}