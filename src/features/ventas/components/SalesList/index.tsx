// src/features/ventas/components/SalesList/index.tsx
"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSalesList } from "../../hooks/useSalesList";
import { fmtCurrency, fmtDateTime } from "../../utils/salesList.utils";
import { PAGE_SIZE_OPTIONS } from "../../types/salesList.types";
import type { Sale, SaleItem } from "../../types/salesList.types";
import { Table, Row, Cell } from "@/components/common/Table";
import type { ColHeader } from "@/components/common/Table";

const COL_TEMPLATE = "80px 1.4fr 110px 110px 90px 1fr";

const HEADERS: ColHeader[] = [
  { label: "#" },
  { label: "Cliente" },
  { label: "Fecha" },
  { label: "Tipo" },
  { label: "Total", align: "right" },
  { label: "Ítems" },
];

function ItemBadge({ item }: { item: SaleItem }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{
        background: "var(--su-bg-deep)",
        color: "var(--su-text-muted)",
        border: "1px solid var(--su-border)",
      }}
    >
      <span className="font-mono font-bold" style={{ color: "var(--brand-indigo)" }}>
        {item.code}
      </span>
      — {item.name}
      {!item.es_servicio && item.lot && (
        <span style={{ color: "var(--su-text-subtle)" }}>(Lote: {item.lot})</span>
      )}
    </span>
  );
}

function ItemsCell({ sale, expanded, onToggle }: {
  sale: Sale;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (!sale.items?.length) {
    return <span className="text-xs" style={{ color: "var(--su-text-subtle)" }}>Sin ítems</span>;
  }
  const visible = expanded ? sale.items : sale.items.slice(0, 2);
  return (
    <div className="flex flex-wrap gap-1 items-start">
      {visible.map((item, i) => <ItemBadge key={i} item={item} />)}
      {sale.items.length > 2 && (
        <button
          type="button"
          onClick={onToggle}
          className="text-[11px] font-medium underline underline-offset-2"
          style={{ color: "var(--brand-indigo)" }}
        >
          {expanded ? "Ver menos" : `+${sale.items.length - 2} más`}
        </button>
      )}
    </div>
  );
}

function SaleRow({ sale, expanded, onToggle }: {
  sale: Sale;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Row colTemplate={COL_TEMPLATE} py="py-3">
      <Cell font="mono" main={sale.sale_number} />
      <Cell main={sale.customer} />
      <Cell main={fmtDateTime(sale.issue_date)} />
      <Cell main={sale.document_type} />
      <Cell align="right" main={fmtCurrency(sale.total_amount)} />
      <ItemsCell sale={sale} expanded={expanded} onToggle={onToggle} />
    </Row>
  );
}

function EmptyIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1} style={{ color: "var(--su-text-subtle)" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export function SalesList() {
  const {
    sales, totalItems, loading,
    tiposComprobante,
    searchQuery, setSearchQuery,
    tipoComprobanteId,
    fechaDesde, fechaHasta,
    pageIndex, pageSize,
    expandedRows,
    onKeyup, onSearchEnter,
    onTipoChange,
    onRangeChange,
    onPageChange,
    toggleItems,
  } = useSalesList();

  return (
    <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

      {/* Estilos del DatePicker — mismo que InvoiceFilters */}
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
        .su-datepicker .react-datepicker__day-name { color: var(--su-text-muted); font-size: 0.625rem; font-weight: 700; text-transform: uppercase; }
        .su-datepicker .react-datepicker__day { color: var(--foreground); border-radius: 0.5rem; font-size: 0.75rem; }
        .su-datepicker .react-datepicker__day:hover { background: var(--su-bg-deep); box-shadow: var(--su-shadow-sm); }
        .su-datepicker .react-datepicker__day--selected,
        .su-datepicker .react-datepicker__day--range-start,
        .su-datepicker .react-datepicker__day--range-end { background: linear-gradient(135deg, var(--brand-indigo), var(--brand-purple)) !important; box-shadow: var(--su-shadow-brand); color: white !important; border-radius: 0.5rem; }
        .su-datepicker .react-datepicker__day--in-range { background: rgba(102,16,242,0.10); color: var(--su-text); border-radius: 0; }
        .su-datepicker .react-datepicker__day--in-selecting-range { background: rgba(102,16,242,0.08); }
        .su-datepicker .react-datepicker__day--keyboard-selected { background: rgba(102,16,242,0.15); color: var(--su-text); }
        .su-datepicker .react-datepicker__navigation-icon::before { border-color: var(--su-text-muted); }
        .su-datepicker .react-datepicker__day--outside-month { color: var(--su-text-subtle); }
        .su-datepicker .react-datepicker__triangle { display: none; }
        .su-datepicker .react-datepicker-popper { z-index: 50; }
      `}</style>

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Ventas</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
          Historial y seguimiento de ventas realizadas
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-end gap-3 flex-wrap">

        {/* Buscador */}
        <div className="flex-1 min-w-[220px] max-w-sm flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Buscar venta</label>
          <div className="su-inset rounded-2xl flex items-center gap-2 px-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={onKeyup}
              onKeyDown={(e) => e.key === "Enter" && onSearchEnter()}
              placeholder="Cliente, número…"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
              style={{ color: "var(--foreground)" }}
            />
            <button type="button" onClick={onSearchEnter}
              className="su-icon-btn w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              aria-label="Buscar">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tipo de comprobante — dinámico desde el backend */}
        <div className="w-48 flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Tipo de comprobante</label>
          <select
            value={tipoComprobanteId ?? ""}
            onChange={(e) => onTipoChange(e.target.value === "" ? null : Number(e.target.value))}
            className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            <option value="">Todos</option>
            {tiposComprobante.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Rango de fechas */}
        <div className="flex flex-col gap-1.5 su-datepicker">
          <label className="su-field-label pl-1">Período</label>
          <DatePicker
            selectsRange
            startDate={fechaDesde}
            endDate={fechaHasta}
            onChange={([start, end]) => onRangeChange(start, end)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Desde → Hasta"
            isClearable
            customInput={
              <div className="su-inset rounded-2xl flex items-center gap-2 px-3 py-2.5 cursor-pointer min-w-[210px]">
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

      {/* Tabla */}
      <Table
        title="Lista de Ventas"
        colTemplate={COL_TEMPLATE}
        headers={HEADERS}
        loading={loading}
        loadingMessage="Cargando ventas…"
        emptyMessage="No se encontraron ventas"
        emptyIcon={<EmptyIcon />}
        currentPage={pageIndex}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={onPageChange}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      >
        {sales.map((sale, i) => (
          <SaleRow
            key={`${sale.sale_number}-${i}`}
            sale={sale}
            expanded={!!expandedRows[i]}
            onToggle={() => toggleItems(i)}
          />
        ))}
      </Table>
    </div>
  );
}