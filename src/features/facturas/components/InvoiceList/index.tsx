// src/features/facturas/components/InvoiceList/index.tsx
"use client";

import { useInvoiceList } from "@/features/facturas/hooks/useInvoiceList";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceRowActions } from "./InvoiceRowActions";
import { Table, Row, Cell } from "@/components/common/Table";
import type { ColHeader } from "@/components/common/Table";
import type { FacturaItem } from "@/features/facturas/types/invoice.types";
import {
  fmt, fmtFecha, fmtHora,
  getEstadoStyles, getAmbienteStyles,
} from "../../utils/format";

// ── Columnas ──────────────────────────────────────────────────────────────────

const COL_TEMPLATE = "200px 1fr 88px 148px 80px 52px 120px";

const HEADERS: ColHeader[] = [
  { label: "N° Venta" },
  { label: "Cliente" },
  { label: "Emisión" },
  { label: "Estado" },
  { label: "Total",   align: "right" },
  { label: "XML" },
  { label: "" },
];

// ── Chip — decisión del feature ───────────────────────────────────────────────

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

// ── Celda XML — nodo libre ────────────────────────────────────────────────────

function XmlCell({ tieneXml }: { tieneXml: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {tieneXml ? (
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
  );
}

// ── Ícono vacío ───────────────────────────────────────────────────────────────

function EmptyIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1}
      style={{ color: "var(--su-text-subtle)" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );
}

// ── Fila ──────────────────────────────────────────────────────────────────────

function FacturaRow({
  factura,
  syncingId, printingId, printingA4Id, retryingId,
  onSync, onPrintTicket, onPrintA4, onRetry,
}: {
  factura: FacturaItem;
  syncingId: number | null;
  printingId: number | null;
  printingA4Id: number | null;
  retryingId: number | null;
  onSync: (f: FacturaItem) => void;
  onPrintTicket: (f: FacturaItem) => void;
  onPrintA4: (f: FacturaItem) => void;
  onRetry: (f: FacturaItem) => void;
}) {
  const estadoStyle   = getEstadoStyles(factura.estado);
  const ambienteStyle = getAmbienteStyles(factura.ambiente);

  return (
    <Row colTemplate={COL_TEMPLATE} py="py-2.5">

      {/* N° Venta + clave acceso */}
      <Cell
        font="mono"
        main={factura.numero_venta}
        sub={
          <span
            className="text-[9px] break-all"
            style={{ wordBreak: "break-all" }}
            title={factura.clave_acceso}
          >
            {factura.clave_acceso}
          </span>
        }
      />

      {/* Cliente + identificación */}
      <Cell
        main={factura.cliente}
        sub={factura.identificacion}
      />

      {/* Fecha emisión + hora autorización */}
      <Cell
        main={fmtFecha(factura.fecha_emision)}
        sub={`Auth: ${fmtHora(factura.fecha_autorizacion)}`}
      />

      {/* Estado + ambiente — dos chips, nodo libre */}
      <div className="flex flex-wrap gap-1 overflow-hidden">
        <Chip {...estadoStyle} label={factura.estado} />
        <Chip {...ambienteStyle} label={ambienteStyle.label} />
      </div>

      {/* Total */}
      <Cell align="right" main={fmt(factura.total)} />

      {/* XML — nodo libre con ícono */}
      <XmlCell tieneXml={factura.tiene_xml} />

      {/* Acciones — ancho fijo para no desplazar columnas */}
      <div className="flex items-center justify-end">
        <InvoiceRowActions
          factura={factura}
          syncingId={syncingId}
          printingId={printingId}
          printingA4Id={printingA4Id}
          retryingId={retryingId}
          onSync={onSync}
          onPrintTicket={onPrintTicket}
          onPrintA4={onPrintA4}
          onRetry={onRetry}
        />
      </div>

    </Row>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function InvoiceList() {
  const {
    searchText, setSearchText,
    selectedEstado, setSelectedEstado,
    fechaDesde, fechaHasta, onRangeChange,
    onSearchKeyup, applyFilters,
    currentPage, totalItems, itemsPerPage, onPageChange,
    facturas, estados, isLoading,
    syncingId, printingId, printingA4Id, retryingId,
    onSync, onRetry, onPrintTicket, onPrintA4,
  } = useInvoiceList();

  return (
    <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Facturas Electrónicas
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
          Gestión y seguimiento de comprobantes SRI
        </p>
      </div>

      {/* Filtros — InvoiceFilters no cambia */}
      <InvoiceFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearchKeyup={onSearchKeyup}
        onSearch={applyFilters}
        selectedEstado={selectedEstado}
        onEstadoChange={setSelectedEstado}
        estados={estados}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onRangeChange={onRangeChange}
      />

      {/* Tabla */}
      <Table
        colTemplate={COL_TEMPLATE}
        headers={HEADERS}
        loading={isLoading}
        loadingMessage="Cargando facturas…"
        emptyMessage="No se encontraron facturas"
        emptyIcon={<EmptyIcon />}
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        pageSizeOptions={[30, 50, 100]}
      >
        {facturas.map((f) => (
          <FacturaRow
            key={f.factura_id}
            factura={f}
            syncingId={syncingId}
            printingId={printingId}
            printingA4Id={printingA4Id}
            retryingId={retryingId}
            onSync={onSync}
            onPrintTicket={onPrintTicket}
            onPrintA4={onPrintA4}
            onRetry={onRetry}
          />
        ))}
      </Table>

    </div>
  );
}