// src/features/reportes/components/Dashboard/StockBajoTable.tsx
"use client";

import { useState, useMemo } from "react";
import { StockBajoResponse } from "@/features/reportes/types/reportes.types";

interface Props {
  stockBajo: StockBajoResponse;
}

const PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++)
    pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export function StockBajoTable({ stockBajo }: Props) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const totalPages = Math.ceil(stockBajo.total / perPage);
  const from = (page - 1) * perPage;
  const slice = useMemo(
    () => stockBajo.items.slice(from, from + perPage),
    [stockBajo.items, from, perPage]
  );
  const pageNumbers = getPageNumbers(page, totalPages);

  const handlePerPage = (n: number) => {
    setPerPage(n);
    setPage(1);
  };

  if (stockBajo.total === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="su-field-label">
        Stock bajo ({stockBajo.total} productos)
      </h2>

      <div className="su-surface-md rounded-2xl overflow-hidden">
        {/* ── Tabla ── */}
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--su-border-strong)" }}>
              {["Código", "Producto", "Stock", "Umbral"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${
                    i >= 2 ? "text-right" : "text-left"
                  }`}
                  style={{ color: "var(--su-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((p) => (
              <tr
                key={p.item_id}
                className="transition-colors"
                style={{ borderTop: "1px solid var(--su-border)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--su-bg-deep)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "")
                }
              >
                <td
                  className="px-4 py-3 font-mono text-[11px]"
                  style={{ color: "var(--su-text-muted)" }}
                >
                  {p.codigo}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>
                  {p.nombre}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-500">
                  {p.stock_total}
                </td>
                <td
                  className="px-4 py-3 text-right text-sm"
                  style={{ color: "var(--su-text-muted)" }}
                >
                  {p.umbral}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Paginación ── */}
        <div
          className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5"
          style={{ borderTop: "1px solid var(--su-border-strong)" }}
        >
          {/* Info + filas por página */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-[11px]"
              style={{ color: "var(--su-text-muted)" }}
            >
              {from + 1}–{Math.min(from + perPage, stockBajo.total)} de{" "}
              {stockBajo.total}
            </span>
            <div
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: "var(--su-text-muted)" }}
            >
              Filas:
              <select
                value={perPage}
                onChange={(e) => handlePerPage(Number(e.target.value))}
                className="text-[11px] rounded-lg px-1.5 py-0.5 su-surface"
                style={{ color: "var(--foreground)" }}
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones de página */}
          <div className="flex items-center gap-1.5">
            <PagBtn
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="Anterior"
            >
              ‹
            </PagBtn>

            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="text-[13px] px-0.5"
                  style={{ color: "var(--su-text-muted)" }}
                >
                  …
                </span>
              ) : (
                <PagBtn
                  key={p}
                  active={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PagBtn>
              )
            )}

            <PagBtn
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              aria-label="Siguiente"
            >
              ›
            </PagBtn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Botón de paginación ── */
interface PagBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PagBtn({ active, disabled, children, ...props }: PagBtnProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className="flex items-center justify-center w-[30px] h-[30px] rounded-lg text-[13px] font-semibold transition-all"
      style={
        active
          ? {
              background: "linear-gradient(135deg, var(--brand-blue), var(--brand-sky))",
              color: "white",
              boxShadow: "var(--su-shadow-brand)",
              border: "1px solid transparent",
            }
          : {
              background: "var(--su-bg)",
              boxShadow: disabled ? "none" : "var(--su-shadow-sm)",
              border: "1px solid var(--su-border)",
              color: disabled ? "var(--su-text-subtle)" : "var(--su-text-muted)",
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? "default" : "pointer",
            }
      }
    >
      {children}
    </button>
  );
}