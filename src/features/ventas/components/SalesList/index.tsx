// src/features/ventas/components/SalesList/index.tsx
"use client";

import { useSalesList } from "../../hooks/useSalesList";
import { fmtCurrency, fmtDateTime } from "../../utils/salesList.utils";
import { FORMA_PAGO_OPTIONS, PAGE_SIZE_OPTIONS } from "../../types/salesList.types";
import type { Sale, SaleItem } from "../../types/salesList.types";
import { Table, Row, Cell } from "@/components/common/Table";
import type { ColHeader } from "@/components/common/Table";

// ── Columnas ──────────────────────────────────────────────────────────────────

const COL_TEMPLATE = "80px 1.4fr 110px 110px 130px 90px 1fr";

const HEADERS: ColHeader[] = [
  { label: "#" },
  { label: "Cliente" },
  { label: "Fecha" },
  { label: "Tipo" },
  { label: "Forma de Pago" },
  { label: "Total", align: "right" },
  { label: "Ítems" },
];

// ── Badge de ítem ─────────────────────────────────────────────────────────────

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

// ── Celda de ítems con expand/collapse ───────────────────────────────────────

function ItemsCell({ sale, expanded, onToggle }: {
  sale: Sale;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (!sale.items?.length) {
    return (
      <span className="text-xs" style={{ color: "var(--su-text-subtle)" }}>
        Sin ítems
      </span>
    );
  }

  const visible = expanded ? sale.items : sale.items.slice(0, 2);

  return (
    <div className="flex flex-wrap gap-1 items-start">
      {visible.map((item, i) => (
        <ItemBadge key={i} item={item} />
      ))}
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

// ── Fila ──────────────────────────────────────────────────────────────────────

function SaleRow({ sale, index, expanded, onToggle }: {
  sale: Sale;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Row colTemplate={COL_TEMPLATE} py="py-3">
      <Cell font="mono" main={sale.sale_number} />
      <Cell main={sale.customer} />
      <Cell main={fmtDateTime(sale.issue_date)} />
      <Cell main={sale.document_type} />
      <Cell main={sale.payment_method} />
      <Cell align="right" main={fmtCurrency(sale.total_amount)} />
      <ItemsCell sale={sale} expanded={expanded} onToggle={onToggle} />
    </Row>
  );
}

// ── Ícono vacío ───────────────────────────────────────────────────────────────

function EmptyIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1}
      style={{ color: "var(--su-text-subtle)" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function SalesList() {
  const {
    sales, totalItems, loading,
    searchQuery, setSearchQuery,
    formaPago,
    pageIndex, pageSize,
    expandedRows,
    onKeyup, onSearchEnter,
    onFormaPagoChange,
    onPageChange,
    toggleItems,
  } = useSalesList();

  return (
    <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

      {/* ── Encabezado ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Ventas
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
          Historial y seguimiento de ventas realizadas
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex items-end gap-3 flex-wrap justify-between">

        <div className="flex-1 min-w-[220px] max-w-md mx-auto flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Buscar venta</label>
          <div className="su-inset rounded-2xl flex items-center gap-2 px-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={onKeyup}
              onKeyDown={(e) => e.key === "Enter" && onSearchEnter()}
              placeholder="Buscar por cliente, tipo, etc."
              className="flex-1 bg-transparent py-2.5 text-sm outline-none
                         placeholder:text-[var(--su-text-subtle)]"
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

        <div className="w-48 flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Forma de Pago</label>
          <select
            value={formaPago}
            onChange={(e) => onFormaPagoChange(e.target.value)}
            className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            {FORMA_PAGO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tabla ── */}
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
            index={i}
            expanded={!!expandedRows[i]}
            onToggle={() => toggleItems(i)}
          />
        ))}
      </Table>
    </div>
  );
}