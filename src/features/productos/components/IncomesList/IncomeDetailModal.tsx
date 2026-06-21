// src/features/productos/components/IncomeDetailModal/index.tsx
"use client";

import { GenericSelector } from "@/components/common/GenericSelector";
import { useIncomeDetail } from "../../hooks/useIncomeDetail";
import type { DetalleItem, EditableField } from "../../types/incomeDetailModal.types";

// ── Helpers de formato ────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}
function getEstadoStyle(estado: string) {
  const map: Record<string, { background: string; color: string }> = {
    PAGADO:    { background: "#bbf7d0", color: "#14532d" },
    PARCIAL:   { background: "#fed7aa", color: "#7c2d12" },
    PENDIENTE: { background: "#fef08a", color: "#713f12" },
  };
  return map[estado] ?? { background: "var(--su-bg-deep)", color: "var(--su-text-muted)" };
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
      style={{
        background: checked
          ? "linear-gradient(135deg, var(--brand-indigo), var(--brand-purple))"
          : "var(--su-bg-deep)",
        boxShadow: checked ? "var(--su-shadow-brand)" : "var(--su-shadow-inset)",
        border: "1px solid var(--su-border)",
      }}
    >
      <span className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
        style={{ transform: checked ? "translateX(22px)" : "translateX(3px)" }} />
    </button>
  );
}

// ── Spinner inline ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span className="w-4 h-4 rounded-full border-2 animate-spin inline-block shrink-0"
      style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
  );
}

// ── Campo editable inline ─────────────────────────────────────────────────────

function InlineEditText({ value, onChange, onSave, onCancel, saving, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-1 mt-1">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
        className="su-inset rounded-xl px-3 py-1.5 text-sm outline-none flex-1"
        style={{ color: "var(--foreground)" }}
        autoFocus
      />
      <button type="button" onClick={onSave} disabled={saving}
        className="su-icon-btn w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ color: "var(--brand-indigo)" }}>
        {saving ? <Spinner /> : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <button type="button" onClick={onCancel}
        className="su-icon-btn w-7 h-7 rounded-lg flex items-center justify-center">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function EditPencil({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="su-icon-btn w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0"
      style={{ color: "var(--su-text-muted)" }}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
      </svg>
    </button>
  );
}

// ── Tabla de detalles ─────────────────────────────────────────────────────────

const DET_COL = "90px 1fr 100px 60px 100px 80px 100px 110px 48px";
const DET_HEADERS = [
  "Código", "Producto", "Lote",
  { label: "Cant.", align: "right" as const },
  { label: "Costo Unit.", align: "right" as const },
  { label: "Desc.", align: "right" as const },
  { label: "Subtotal", align: "right" as const },
  { label: "PVP Sugerido", align: "right" as const },
  "",
];

function DetalleRow({ d, removing, onRemove }: {
  d: DetalleItem;
  removing: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="grid items-center gap-3 px-4 py-2.5 border-t"
      style={{ gridTemplateColumns: DET_COL, borderColor: "var(--su-border)" }}>
      <p className="text-xs font-mono truncate" style={{ color: "var(--su-text-muted)" }}>{d.codigo}</p>
      <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>{d.nombre}</p>
      <div>
        {d.numero_lote
          ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "var(--su-bg-deep)", color: "var(--su-text-muted)" }}>
              {d.numero_lote}
            </span>
          : <span style={{ color: "var(--su-text-subtle)" }}>—</span>
        }
      </div>
      <p className="text-sm text-right tabular-nums" style={{ color: "var(--foreground)" }}>{d.cantidad}</p>
      <p className="text-sm text-right tabular-nums" style={{ color: "var(--foreground)" }}>{fmtCurrency(d.costo_unitario)}</p>
      <p className="text-sm text-right tabular-nums" style={{ color: "var(--su-text-muted)" }}>
        {d.descuento_linea > 0 ? fmtCurrency(d.descuento_linea) : "—"}
      </p>
      <p className="text-sm font-bold text-right tabular-nums" style={{ color: "var(--su-text)" }}>
        {fmtCurrency(d.subtotal_linea)}
      </p>
      <p className="text-sm text-right tabular-nums" style={{ color: "var(--brand-indigo)" }}>
        {d.precio_venta_sugerido ? fmtCurrency(d.precio_venta_sugerido) : "—"}
      </p>
      <div className="flex justify-center">
        <button type="button" onClick={onRemove} disabled={removing}
          className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
          aria-label="Eliminar ítem">
          {removing ? <Spinner /> : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} style={{ color: "#dc2626" }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  compraId: number;
  onClose: () => void;
}

export function IncomeDetailModal({ compraId, onClose }: Props) {
  const {
    compra, loading,
    tiposDocumento, estadosPago, proveedores, productosDB,
    editingField, editValue, setEditValue, savingField,
    editandoProveedor,
    mostrarAgregarItem, setMostrarAgregarItem,
    addItem, patchAddItem, savingItem, removingId,
    startEdit, cancelEdit, saveField, saveSelect,
    toggleEditProveedor, buscarProveedores, onProveedorSeleccionado,
    buscarProductos, onItemSeleccionado, guardarNuevoItem, cancelarAgregarItem,
    quitarItem, cerrar,
  } = useIncomeDetail(compraId, onClose);

  const isEditing = (f: EditableField) => editingField === f;
  const isSaving  = (f: EditableField) => savingField === f;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>

      <div className="su-surface-lg rounded-3xl w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden
                      animate-[float-in_0.3s_cubic-bezier(0.34,1.4,0.64,1)_forwards]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="su-brand w-9 h-9 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="su-avatar-shine" />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--su-text)" }}>Detalle del Ingreso</p>
              {compra && (
                <p className="text-[11px] font-mono" style={{ color: "var(--su-text-muted)" }}>
                  {compra.numero_documento}
                </p>
              )}
            </div>
          </div>
          <button onClick={cerrar} className="su-icon-btn w-8 h-8 rounded-xl text-sm">✕</button>
        </div>

        <div className="su-divider mx-6 shrink-0" />

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {loading ? (
            <div className="flex h-64 items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
              <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>Cargando detalle…</span>
            </div>
          ) : compra && (
            <>
              {/* ── Grid info superior ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* Card: Proveedor */}
                <div className="su-surface rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="su-field-label">Proveedor</span>
                    <div className="flex items-center gap-1">
                      {isSaving("proveedor_id" as EditableField) && <Spinner />}
                      <button type="button" onClick={toggleEditProveedor}
                        className="su-icon-btn w-7 h-7 rounded-lg flex items-center justify-center"
                        title={editandoProveedor ? "Cancelar" : "Cambiar proveedor"}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor" strokeWidth={2}>
                          {editandoProveedor
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                          }
                        </svg>
                      </button>
                    </div>
                  </div>

                  {editandoProveedor ? (
                    <GenericSelector
                      label=""
                      placeholder="Buscar proveedor…"
                      options={proveedores}
                      onSelect={(item) => { if (item) onProveedorSeleccionado(item); }}
                    />
                  ) : (
                    <>
                      <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{compra.proveedor}</p>
                      <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>{compra.proveedor_identificacion}</p>
                      {compra.proveedor_nombre_comercial && <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>{compra.proveedor_nombre_comercial}</p>}
                      {compra.proveedor_email && <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>✉ {compra.proveedor_email}</p>}
                      {compra.proveedor_telefono && <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>☎ {compra.proveedor_telefono}</p>}
                      {compra.proveedor_pais && <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>🌐 {compra.proveedor_pais}</p>}
                    </>
                  )}
                </div>

                {/* Card: Documento */}
                <div className="su-surface rounded-2xl p-4 flex flex-col gap-2">
                  <span className="su-field-label">Documento</span>

                  {/* N° documento */}
                  <div className="group flex items-center">
                    {isEditing("numero_documento") ? (
                      <InlineEditText value={editValue} onChange={setEditValue}
                        onSave={() => saveField("numero_documento")}
                        onCancel={cancelEdit} saving={isSaving("numero_documento")} />
                    ) : (
                      <>
                        <p className="text-sm font-semibold font-mono" style={{ color: "var(--foreground)" }}>
                          {compra.numero_documento}
                        </p>
                        <EditPencil onClick={() => startEdit("numero_documento", compra.numero_documento)} />
                      </>
                    )}
                  </div>

                  {/* Tipo documento */}
                  <div className="group flex items-center gap-1">
                    {isEditing("tipo_doc_id") ? (
                      <div className="flex items-center gap-1 w-full">
                        <select value={editValue}
                          onChange={(e) => saveSelect("tipo_doc_id", Number(e.target.value))}
                          className="su-inset rounded-xl px-2 py-1 text-xs outline-none flex-1"
                          style={{ color: "var(--foreground)", background: "var(--su-bg)" }}>
                          {tiposDocumento.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button type="button" onClick={cancelEdit}
                          className="su-icon-btn w-6 h-6 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>{compra.tipo_documento}</p>
                        <EditPencil onClick={() => startEdit("tipo_doc_id", "")} />
                      </>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="group flex items-center gap-1">
                    {isEditing("fecha_emision") ? (
                      <InlineEditText value={editValue} onChange={setEditValue} type="date"
                        onSave={() => saveField("fecha_emision")}
                        onCancel={cancelEdit} saving={isSaving("fecha_emision")} />
                    ) : (
                      <>
                        <p className="text-xs" style={{ color: "var(--su-text-muted)" }}>
                          📅 {fmtDate(compra.fecha_emision)}
                        </p>
                        <EditPencil onClick={() => startEdit("fecha_emision", compra.fecha_emision.split("T")[0])} />
                      </>
                    )}
                  </div>

                  <p className="text-xs" style={{ color: "var(--su-text-subtle)" }}>
                    👤 {compra.usuario_registro}
                  </p>
                </div>

                {/* Card: Estado pago */}
                <div className="su-surface rounded-2xl p-4 flex flex-col gap-3">
                  <span className="su-field-label">Estado de Pago</span>

                  <div className="group flex items-center gap-2">
                    {isEditing("estado_pago_id") ? (
                      <div className="flex items-center gap-1 w-full">
                        <select value={editValue}
                          onChange={(e) => saveSelect("estado_pago_id", Number(e.target.value))}
                          className="su-inset rounded-xl px-2 py-1 text-xs outline-none flex-1"
                          style={{ color: "var(--foreground)", background: "var(--su-bg)" }}>
                          {estadosPago.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <button type="button" onClick={cancelEdit}
                          className="su-icon-btn w-6 h-6 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ ...getEstadoStyle(compra.estado_pago), border: "1px solid rgba(0,0,0,0.08)" }}>
                          {compra.estado_pago}
                        </span>
                        {isSaving("estado_pago_id") && <Spinner />}
                        <EditPencil onClick={() => startEdit("estado_pago_id", "")} />
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--su-text-muted)" }}>Total:</span>
                      <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{fmtCurrency(compra.total_pagar)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--su-text-muted)" }}>Pagado:</span>
                      <span className="tabular-nums" style={{ color: "#16a34a" }}>{fmtCurrency(compra.total_pagado)}</span>
                    </div>
                    {compra.saldo_pendiente > 0 && (
                      <>
                        <div className="su-divider my-1" />
                        <div className="flex justify-between text-xs font-bold">
                          <span style={{ color: "#dc2626" }}>Saldo:</span>
                          <span className="tabular-nums" style={{ color: "#dc2626" }}>{fmtCurrency(compra.saldo_pendiente)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card: Resumen financiero */}
                <div className="su-surface rounded-2xl p-4 flex flex-col gap-2">
                  <span className="su-field-label">Resumen</span>

                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--su-text-muted)" }}>Subtotal:</span>
                    <span className="tabular-nums">{fmtCurrency(compra.subtotal)}</span>
                  </div>

                  {/* Desc. global editable */}
                  <div className="flex justify-between text-xs items-center group">
                    <span style={{ color: "var(--su-text-muted)" }}>Desc. Global:</span>
                    {isEditing("descuento_global") ? (
                      <InlineEditText value={editValue} onChange={setEditValue} type="number"
                        onSave={() => saveField("descuento_global")}
                        onCancel={cancelEdit} saving={isSaving("descuento_global")} />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="tabular-nums">{fmtCurrency(compra.descuento_global)}</span>
                        <EditPencil onClick={() => startEdit("descuento_global", String(compra.descuento_global))} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--su-text-muted)" }}>IVA ({compra.porcentaje_impuesto}%):</span>
                    <span className="tabular-nums">{fmtCurrency(compra.valor_impuesto)}</span>
                  </div>

                  {/* Gastos envío editable */}
                  <div className="flex justify-between text-xs items-center group">
                    <span style={{ color: "var(--su-text-muted)" }}>Envío:</span>
                    {isEditing("gastos_envio") ? (
                      <InlineEditText value={editValue} onChange={setEditValue} type="number"
                        onSave={() => saveField("gastos_envio")}
                        onCancel={cancelEdit} saving={isSaving("gastos_envio")} />
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="tabular-nums">{fmtCurrency(compra.gastos_envio)}</span>
                        <EditPencil onClick={() => startEdit("gastos_envio", String(compra.gastos_envio))} />
                      </div>
                    )}
                  </div>

                  <div className="su-divider my-1" />
                  <div className="flex justify-between text-sm font-bold">
                    <span style={{ color: "var(--su-text)" }}>TOTAL:</span>
                    <span className="tabular-nums" style={{ color: "var(--brand-indigo)" }}>{fmtCurrency(compra.total_pagar)}</span>
                  </div>
                </div>
              </div>

              {/* ── Observaciones ── */}
              <div className="su-surface rounded-2xl p-4">
                <div className="group flex items-start gap-2">
                  <span className="su-field-label mt-0.5">Observaciones</span>
                  {!isEditing("observaciones") && (
                    <EditPencil onClick={() => startEdit("observaciones", compra.observaciones ?? "")} />
                  )}
                </div>
                {isEditing("observaciones") ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                      className="su-inset rounded-xl px-3 py-2 text-sm outline-none w-full resize-none"
                      style={{ color: "var(--foreground)" }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveField("observaciones")}
                        disabled={isSaving("observaciones")}
                        className="su-brand rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40">
                        {isSaving("observaciones") ? <Spinner /> : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        Guardar
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="su-icon-btn rounded-xl px-3 py-1.5 text-xs">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm mt-1" style={{ color: compra.observaciones ? "var(--foreground)" : "var(--su-text-subtle)" }}>
                    {compra.observaciones || "Sin observaciones"}
                  </p>
                )}
              </div>

              {/* ── Ítems ingresados ── */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "var(--su-text)" }}>
                      Ítems Ingresados
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full su-brand">
                      {compra.detalles.length}
                    </span>
                  </div>
                  <button type="button"
                    onClick={() => mostrarAgregarItem ? cancelarAgregarItem() : setMostrarAgregarItem(true)}
                    className="su-icon-btn rounded-2xl px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth={2.5}>
                      {mostrarAgregarItem
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      }
                    </svg>
                    {mostrarAgregarItem ? "Cancelar" : "Agregar Ítem"}
                  </button>
                </div>

                {/* Form agregar ítem */}
                {mostrarAgregarItem && (
                  <div className="su-surface rounded-2xl p-4 flex flex-col gap-4">
                    <div className="max-w-sm">
                      <GenericSelector
                        label="Buscar Producto"
                        placeholder="Código, nombre, marca…"
                        options={productosDB}
                        onSelect={(item) => {
                          if (item) {
                            const prod = productosDB.find((p) => p.id === item.id);
                            if (prod) onItemSeleccionado(prod);
                          }
                        }}
                      />
                    </div>

                    {addItem.item_id && (
                      <>
                        <div className="flex items-center gap-2 text-sm font-semibold"
                          style={{ color: "var(--brand-indigo)" }}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {addItem.nombre_visual}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: "Cantidad",     field: "cantidad",               type: "number", min: 1 },
                            { label: "Costo Unit.",  field: "costo_unitario",         type: "number", min: 0 },
                            { label: "Descuento",    field: "descuento_linea",        type: "number", min: 0 },
                            { label: "PVP Sugerido", field: "precio_venta_sugerido",  type: "number", min: 0 },
                          ].map(({ label, field, type, min }) => (
                            <div key={field} className="flex flex-col gap-1.5">
                              <label className="su-field-label pl-1">{label}</label>
                              <input
                                type={type} min={min}
                                value={(addItem as any)[field]}
                                onChange={(e) => patchAddItem({ [field]: Number(e.target.value) } as any)}
                                className="su-inset rounded-xl px-3 py-1.5 text-sm outline-none w-full text-right tabular-nums"
                                style={{ color: "var(--foreground)" }}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>Aplicar PVP</span>
                            <Toggle
                              checked={addItem.aplicar_pvp}
                              onChange={(v) => patchAddItem({ aplicar_pvp: v })}
                            />
                          </div>
                          <button type="button" onClick={guardarNuevoItem}
                            disabled={savingItem || !addItem.item_id}
                            className="su-brand rounded-2xl px-4 py-2 text-sm font-bold flex items-center gap-2
                                       disabled:opacity-40 disabled:cursor-not-allowed">
                            {savingItem ? <Spinner /> : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Guardar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tabla detalles */}
                <div className="su-surface rounded-2xl overflow-hidden">
                  <div className="grid items-center gap-3 px-4 py-2"
                    style={{ gridTemplateColumns: DET_COL, background: "var(--su-bg-deep)" }}>
                    {DET_HEADERS.map((h, i) => (
                      <span key={i} className="su-field-label"
                        style={{ textAlign: typeof h === "object" ? h.align : "left" }}>
                        {typeof h === "object" ? h.label : h}
                      </span>
                    ))}
                  </div>
                  {compra.detalles.map((d) => (
                    <DetalleRow
                      key={d.detalle_id}
                      d={d}
                      removing={removingId === d.detalle_id}
                      onRemove={() => quitarItem(d.detalle_id, d.nombre)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 shrink-0 border-t" style={{ borderColor: "var(--su-border)" }}>
          <button type="button" onClick={cerrar}
            className="su-icon-btn rounded-2xl px-5 py-2.5 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}