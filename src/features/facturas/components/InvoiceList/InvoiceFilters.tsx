// src/features/facturas/components/InvoiceList/InvoiceFilters.tsx
"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { EstadoItem } from "@/features/facturas/types/invoice.types";

interface Props {
  searchText: string;
  onSearchChange: (v: string) => void;
  onSearchKeyup: () => void;
  onSearch: () => void;

  selectedEstado: string;
  onEstadoChange: (v: string) => void;
  estados: EstadoItem[];

  fechaDesde: Date | null;
  fechaHasta: Date | null;
  onRangeChange: (start: Date | null, end: Date | null) => void;
}

export function InvoiceFilters({
  searchText, onSearchChange, onSearchKeyup, onSearch,
  selectedEstado, onEstadoChange, estados,
  fechaDesde, fechaHasta, onRangeChange,
}: Props) {
  return (
    <>
      {/* Inyectamos overrides del calendario al tema su-* */}
      <style>{`
        .su-datepicker .react-datepicker {
          font-family: inherit;
          border: 1px solid var(--su-border-strong);
          border-radius: 1.25rem;
          background: var(--su-bg);
          box-shadow: var(--su-shadow-lg);
          overflow: hidden;
        }
        .su-datepicker .react-datepicker__header {
          background: var(--su-bg-deep);
          border-bottom: 1px solid var(--su-border);
          padding: 12px 0 8px;
        }
        .su-datepicker .react-datepicker__current-month {
          color: var(--su-text);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .su-datepicker .react-datepicker__day-name {
          color: var(--su-text-muted);
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .su-datepicker .react-datepicker__day {
          color: var(--foreground);
          border-radius: 0.5rem;
          font-size: 0.75rem;
        }
        .su-datepicker .react-datepicker__day:hover {
          background: var(--su-bg-deep);
          box-shadow: var(--su-shadow-sm);
        }
        .su-datepicker .react-datepicker__day--selected,
        .su-datepicker .react-datepicker__day--range-start,
        .su-datepicker .react-datepicker__day--range-end {
          background: linear-gradient(135deg, var(--brand-indigo), var(--brand-purple)) !important;
          box-shadow: var(--su-shadow-brand);
          color: white !important;
          border-radius: 0.5rem;
        }
        .su-datepicker .react-datepicker__day--in-range {
          background: rgba(102,16,242,0.10);
          color: var(--su-text);
          border-radius: 0;
        }
        .su-datepicker .react-datepicker__day--in-selecting-range {
          background: rgba(102,16,242,0.08);
        }
        .su-datepicker .react-datepicker__day--keyboard-selected {
          background: rgba(102,16,242,0.15);
          color: var(--su-text);
        }
        .su-datepicker .react-datepicker__navigation-icon::before {
          border-color: var(--su-text-muted);
        }
        .su-datepicker .react-datepicker__day--outside-month {
          color: var(--su-text-subtle);
        }
        .su-datepicker .react-datepicker__triangle {
          display: none;
        }
        .su-datepicker .react-datepicker-popper {
          z-index: 50;
        }
      `}</style>

      <div className="flex flex-wrap gap-3 items-end">

        {/* ── Buscador ── */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="su-field-label">Buscar</label>
          <div className="su-inset rounded-2xl flex items-center gap-2 px-3 py-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyUp={onSearchKeyup}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Número, clave o cliente…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button onClick={onSearch} className="su-icon-btn rounded-xl p-1" title="Buscar">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Select estado ── */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="su-field-label">Estado</label>
          <select
            value={selectedEstado}
            onChange={(e) => { onEstadoChange(e.target.value); onSearch(); }}
            className="su-inset rounded-2xl px-3 py-2 text-sm outline-none cursor-pointer"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            <option value="">Todos</option>
            {estados.map((e) => (
              <option key={e.id} value={e.name}>{e.name}</option>
            ))}
          </select>
        </div>

        {/* ── DateRangePicker ── */}
        <div className="flex flex-col gap-1 su-datepicker">
          <label className="su-field-label">Período</label>
          <DatePicker
            selectsRange
            startDate={fechaDesde}
            endDate={fechaHasta}
            onChange={([start, end]) => {
              onRangeChange(start, end);
              // Aplica filtros automáticamente al completar el rango
onRangeChange(start, end);
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Desde → Hasta"
            isClearable
            customInput={
              <div
                className="su-inset rounded-2xl flex items-center gap-2 px-3 py-2 cursor-pointer min-w-[210px]"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} style={{ color: "var(--su-text-muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm flex-1" style={{
                  color: fechaDesde ? "var(--foreground)" : "var(--su-text-muted)"
                }}>
                  {fechaDesde && fechaHasta
                    ? `${fechaDesde.toLocaleDateString("es-EC")} → ${fechaHasta.toLocaleDateString("es-EC")}`
                    : fechaDesde
                      ? `${fechaDesde.toLocaleDateString("es-EC")} → …`
                      : "Seleccionar período"}
                </span>
              </div>
            }
          />
        </div>

      </div>
    </>
  );
}