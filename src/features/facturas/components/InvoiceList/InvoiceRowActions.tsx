// src/features/facturas/components/InvoiceList/InvoiceRowActions.tsx
"use client";

import { FacturaItem } from "@/features/facturas/types/invoice.types";

interface Props {
  factura: FacturaItem;
  syncingId:    number | null;
  printingId:   number | null;
  printingA4Id: number | null;
  retryingId:   number | null;
  onSync:        (f: FacturaItem) => void;
  onPrintTicket: (f: FacturaItem) => void;
  onPrintA4:     (f: FacturaItem) => void;
  onRetry:       (f: FacturaItem) => void;
}

function Spinner() {
  return (
    <div
      className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
      style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }}
    />
  );
}

function ActionBtn({
  loading, title, onClick, children,
}: {
  loading: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!loading) onClick(); }}
      disabled={loading}
      title={title}
      className="su-icon-btn rounded-xl p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export function InvoiceRowActions({
  factura,
  syncingId, printingId, printingA4Id, retryingId,
  onSync, onPrintTicket, onPrintA4, onRetry,
}: Props) {
  const canRetry = factura.estado === "PENDIENTE" || factura.estado === "DEVUELTA";

  return (
    <div className="flex items-center gap-1 flex-wrap">

      {/* Sincronizar */}
      <ActionBtn loading={syncingId === factura.factura_id} title="Sincronizar con SRI"
        onClick={() => onSync(factura)}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </ActionBtn>

      {/* Ticket térmico */}
      <ActionBtn loading={printingId === factura.factura_id} title="Imprimir ticket térmico"
        onClick={() => onPrintTicket(factura)}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </ActionBtn>

      {/* A4 / RIDE */}
      <ActionBtn loading={printingA4Id === factura.factura_id} title="Imprimir A4 / RIDE"
        onClick={() => onPrintA4(factura)}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </ActionBtn>

      {/* Reintentar — solo PENDIENTE o DEVUELTA */}
      {canRetry && (
        <ActionBtn loading={retryingId === factura.factura_id} title="Reintentar envío al SRI"
          onClick={() => onRetry(factura)}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </ActionBtn>
      )}

    </div>
  );
}