// src/features/facturas/components/InvoiceList/InvoiceCards.tsx
"use client";

import { FacturaItem } from "@/features/facturas/types/invoice.types";
import { InvoiceRowActions } from "./InvoiceRowActions";
import {
  fmt, fmtFecha, fmtHora,
  getEstadoStyles, getAmbienteStyles,
} from "../../utils/format";

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ border, bg, color, label }: {
  border: string; bg: string; color: string; label: string;
}) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ border: `1px solid ${border}`, background: bg, color }}
    >
      {label}
    </span>
  );
}

// ── Paginación ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [30, 50, 100];

function Pagination({
  currentPage, totalItems, itemsPerPage, onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number, limit: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const from = totalItems === 0 ? 0 : currentPage * itemsPerPage + 1;
  const to   = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-3">
      <span className="text-xs" style={{ color: "var(--su-text-muted)" }}>
        {totalItems > 0 ? `${from}–${to} de ${totalItems}` : "Sin resultados"}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="su-field-label">Filas:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onPageChange(0, Number(e.target.value))}
            className="su-inset rounded-xl px-2 py-1 text-xs outline-none"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1, itemsPerPage)}
            disabled={currentPage === 0}
            className="su-icon-btn rounded-xl px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >→</button>
          <span
            className="su-inset rounded-xl px-3 py-1.5 text-xs flex items-center"
            style={{ color: "var(--su-text-muted)" }}
          >
            {currentPage + 1} / {Math.max(totalPages, 1)}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1, itemsPerPage)}
            disabled={currentPage >= totalPages - 1}
            className="su-icon-btn rounded-xl px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >→</button>
        </div>
      </div>
    </div>
  );
}

// ── Columnas ──────────────────────────────────────────────────────────────────

const COLS = {
  venta:    "200px",
  cliente:  "1fr",
  emision:  "88px",
  estado:   "148px",
  total:    "80px",
  xml:      "52px",
  acciones: "120px",
} as const;

const COL_TEMPLATE = Object.values(COLS).join(" ");

// ── Cabecera ──────────────────────────────────────────────────────────────────

function RowHeader() {
  const headers: { label: string; align?: "right" | "center" }[] = [
    { label: "N° Venta" },
    { label: "Cliente" },
    { label: "Emisión" },
    { label: "Estado" },
    { label: "Total", align: "right" },
    { label: "XML" },
    { label: "" },
  ];

  return (
    <div
      className="grid items-center gap-3 px-4 py-2 border-b"
      style={{ gridTemplateColumns: COL_TEMPLATE, borderColor: "var(--su-divider)" }}
    >
      {headers.map(({ label, align }, i) => (
        <span
          key={i}
          className="su-field-label text-[11px] uppercase tracking-wider select-none"
          style={{ textAlign: align ?? "left" }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Fila individual ───────────────────────────────────────────────────────────

function FacturaRow({
  factura,
  syncingId, printingId, printingA4Id, retryingId, emailingId,
  onSync, onPrintTicket, onPrintA4, onRetry, onSendEmail,
}: {
  factura: FacturaItem;
  syncingId: number | null;
  printingId: number | null;
  printingA4Id: number | null;
  retryingId: number | null;
  emailingId: number | null;
  onSync: (f: FacturaItem) => void;
  onPrintTicket: (f: FacturaItem) => void;
  onPrintA4: (f: FacturaItem) => void;
  onRetry: (f: FacturaItem) => void;
  onSendEmail: (f: FacturaItem) => void;
}) {
  const estadoStyle   = getEstadoStyles(factura.estado);
  const ambienteStyle = getAmbienteStyles(factura.ambiente);

  return (
    <div
      className="grid items-center gap-3 px-4 py-2.5 border-b last:border-b-0
                 transition-colors duration-150 hover:bg-[var(--su-bg-hover,rgba(0,0,0,0.025))]"
      style={{ gridTemplateColumns: COL_TEMPLATE, borderColor: "var(--su-divider)" }}
    >

      {/* ── N° venta ── */}
      <div className="min-w-0 overflow-hidden">
        <p
          className="text-xs font-semibold truncate leading-snug"
          style={{ color: "var(--su-text)" }}
        >
          {factura.numero_venta}
        </p>
        <p
          className="text-[9px] font-mono leading-snug mt-0.5 break-all"
          style={{ color: "var(--su-text-subtle)", wordBreak: "break-all" }}
          title={factura.clave_acceso}
        >
          {factura.clave_acceso}
        </p>
      </div>

      {/* ── Cliente ── */}
      <div className="min-w-0 overflow-hidden">
        <p
          className="text-sm truncate leading-snug"
          style={{ color: "var(--foreground)" }}
        >
          {factura.cliente}
        </p>
        <p
          className="text-[11px] leading-snug mt-0.5 truncate"
          style={{ color: "var(--su-text-muted)" }}
        >
          {factura.identificacion}
        </p>
      </div>

      {/* ── Fechas ── */}
      <div className="overflow-hidden">
        <p className="text-xs leading-snug truncate" style={{ color: "var(--foreground)" }}>
          {fmtFecha(factura.fecha_emision)}
        </p>
        <p className="text-[10px] leading-snug mt-0.5 truncate" style={{ color: "var(--su-text-muted)" }}>
          Auth: {fmtHora(factura.fecha_autorizacion)}
        </p>
      </div>

      {/* ── Chips ── */}
      <div className="flex flex-wrap gap-1 overflow-hidden">
        <Chip {...estadoStyle} label={factura.estado} />
        <Chip {...ambienteStyle} label={ambienteStyle.label} />
      </div>

      {/* ── Total ── */}
      <p
        className="text-sm font-bold text-right tabular-nums"
        style={{ color: "var(--su-text)" }}
      >
        {fmt(factura.total)}
      </p>

      {/* ── XML badge ── */}
      <div className="flex items-center gap-1">
        {factura.tiene_xml ? (
          <>
            <svg className="w-3.5 h-3.5 shrink-0 text-green-500" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold text-green-600">XML</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 shrink-0 text-red-400" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold text-red-400">Sin XML</span>
          </>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center justify-end" style={{ width: COLS.acciones }}>
        <InvoiceRowActions
          factura={factura}
          syncingId={syncingId}
          printingId={printingId}
          printingA4Id={printingA4Id}
          retryingId={retryingId}
          emailingId={emailingId}
          onSync={onSync}
          onPrintTicket={onPrintTicket}
          onPrintA4={onPrintA4}
          onRetry={onRetry}
          onSendEmail={onSendEmail}
        />
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  facturas: FacturaItem[];
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number, limit: number) => void;
  syncingId: number | null;
  printingId: number | null;
  printingA4Id: number | null;
  retryingId: number | null;
  emailingId: number | null;
  onSync: (f: FacturaItem) => void;
  onPrintTicket: (f: FacturaItem) => void;
  onPrintA4: (f: FacturaItem) => void;
  onRetry: (f: FacturaItem) => void;
  onSendEmail: (f: FacturaItem) => void;
}

// ── Componente principal ──────────────────────────────────────────────────────

export function InvoiceCards({
  facturas, isLoading,
  currentPage, totalItems, itemsPerPage, onPageChange,
  syncingId, printingId, printingA4Id, retryingId, emailingId,
  onSync, onPrintTicket, onPrintA4, onRetry, onSendEmail,
}: Props) {

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }}
        />
        <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
          Cargando facturas…
        </span>
      </div>
    );
  }

  if (facturas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={1} style={{ color: "var(--su-text-subtle)" }}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm" style={{ color: "var(--su-text-muted)" }}>
          No se encontraron facturas
        </p>
      </div>
    );
  }

  return (
    <div
      className="su-surface-md rounded-2xl overflow-hidden"
      style={{ border: "0.5px solid var(--su-divider)" }}
    >
      {/* Cabecera */}
      <RowHeader />

      {/* Filas */}
      {facturas.map((f) => (
        <FacturaRow
          key={f.factura_id}
          factura={f}
          syncingId={syncingId}
          printingId={printingId}
          printingA4Id={printingA4Id}
          retryingId={retryingId}
          emailingId={emailingId}
          onSync={onSync}
          onPrintTicket={onPrintTicket}
          onPrintA4={onPrintA4}
          onRetry={onRetry}
          onSendEmail={onSendEmail}
        />
      ))}

      {/* Paginación */}
      <div className="border-t" style={{ borderColor: "var(--su-divider)" }}>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}