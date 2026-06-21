// src/features/productos/components/IncomesList/index.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Table, Row, Cell } from "@/components/common/Table";
import type { ColHeader } from "@/components/common/Table";
import { useIncomesList } from "../../hooks/useIncomesList";
import { IncomeDetailModal } from "./IncomeDetailModal";
import type { CompraItem } from "../../types/incomesList.types";
import {
  fmtCurrency, fmtDate,
  getEstadoStyle, getSaldoPendiente,
} from "../../utils/incomesList.utils";

// ── Columnas ──────────────────────────────────────────────────────────────────

const COL_TEMPLATE = "1.4fr 1.6fr 90px 100px 130px 110px 48px";

const HEADERS: ColHeader[] = [
  { label: "Documento" },
  { label: "Proveedor" },
  { label: "Fecha" },
  { label: "Ítems",   align: "right" },
  { label: "Totales", align: "right" },
  { label: "Estado",  align: "center" },
  { label: "" },
];

// ── Chip de estado ────────────────────────────────────────────────────────────
// El feature decide el chip — Cell solo lo recibe como ReactNode

function EstadoChip({ estado }: { estado: string }) {
  const { background, color } = getEstadoStyle(estado);
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background, color, border: "1px solid rgba(0,0,0,0.08)" }}
    >
      {estado}
    </span>
  );
}

// ── Fila ──────────────────────────────────────────────────────────────────────

function CompraRow({ compra, onVerDetalle }: {
  compra: CompraItem;
  onVerDetalle: (c: CompraItem) => void;
}) {
  const saldo = getSaldoPendiente(compra);

  return (
    <Row colTemplate={COL_TEMPLATE} py="py-3">

      {/* Documento */}
      <Cell
        font="mono"
        main={compra.numero_documento}
        sub={compra.tipo_documento}
      />

      {/* Proveedor */}
      <Cell
        main={compra.proveedor}
        sub={compra.proveedor_identificacion}
      />

      {/* Fecha */}
      <Cell main={fmtDate(compra.fecha_emision)} />

      {/* Ítems */}
      <Cell
        align="right"
        main={compra.total_items}
        sub={`${compra.total_unidades} uds.`}
      />

      {/* Totales */}
      <Cell
        align="right"
        main={fmtCurrency(compra.total_pagar)}
        sub={
          saldo > 0
            ? <span style={{ color: "#dc2626" }}>Saldo: {fmtCurrency(saldo)}</span>
            : undefined
        }
      />

      {/* Estado — chip como ReactNode en main */}
      <Cell
        align="center"
        main={<EstadoChip estado={compra.estado_pago} />}
      />

      {/* Acción */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onVerDetalle(compra); }}
          className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
          title="Ver detalle" aria-label="Ver detalle"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

    </Row>
  );
}

// ── Botón cabecera ────────────────────────────────────────────────────────────

function NuevoIngresoBtn() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/productos/ingreso")}
      className="su-brand rounded-2xl px-4 py-2 text-sm font-bold flex items-center gap-2
                 transition-all duration-150 hover:shadow-[var(--su-shadow-brand-lg)]"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Nuevo Ingreso
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function IncomesList() {
  const {
    compras, estadosPago, totalItems, loading,
    searchText, setSearchText,
    selectedEstado,
    fechaDesde, fechaHasta,
    currentPage, itemsPerPage,
    onKeyup, onSearchEnter,
    onEstadoChange, onRangeChange, onPageChange,
    reload,
  } = useIncomesList();

  const [detailId, setDetailId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

      {/* ── Encabezado ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Ingresos de Mercadería
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
          Registro y seguimiento de compras a proveedores
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex items-end gap-3 flex-wrap">

        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Buscar</label>
          <div className="su-inset rounded-2xl flex items-center gap-2 px-3">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyUp={onKeyup}
              onKeyDown={(e) => e.key === "Enter" && onSearchEnter()}
              placeholder="N° documento o proveedor…"
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

        <div className="w-44 flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Estado Pago</label>
          <select
            value={selectedEstado}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            <option value="">Todos</option>
            {estadosPago.map((e) => (
              <option key={e.id} value={e.name}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 su-datepicker">
          <label className="su-field-label pl-1">Período</label>
          <DatePicker
            selectsRange
            startDate={fechaDesde}
            endDate={fechaHasta}
            onChange={([start, end]) => {
onRangeChange(start, end);
            }}
            dateFormat="dd/MM/yyyy"
            placeholderText="Desde → Hasta"
            isClearable
            customInput={
              <div className="su-inset rounded-2xl flex items-center gap-2 px-3 py-2 cursor-pointer min-w-[210px]">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2} style={{ color: "var(--su-text-muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm flex-1"
                  style={{ color: fechaDesde ? "var(--foreground)" : "var(--su-text-muted)" }}>
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

      {/* ── Tabla ── */}
      <Table
        title="Ingresos de Mercadería"
        headerActions={<NuevoIngresoBtn />}
        colTemplate={COL_TEMPLATE}
        headers={HEADERS}
        loading={loading}
        loadingMessage="Cargando ingresos…"
        emptyMessage="No se encontraron ingresos"
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      >
        {compras.map((c) => (
          <CompraRow
            key={c.compra_id}
            compra={c}
            onVerDetalle={(c) => setDetailId(c.compra_id)}
          />
        ))}
      </Table>

      {/* ── Modal ── */}
      {detailId !== null && (
        <IncomeDetailModal
          compraId={detailId}
          onClose={() => { setDetailId(null); reload(); }}
        />
      )}
    </div>
  );
}