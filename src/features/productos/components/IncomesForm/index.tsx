"use client";

import { useState } from "react";
import { GenericSelector } from "@/components/common/GenericSelector";
import { NumericInput } from "@/components/common/NumericInput";
import { useIncomesForm } from "../../hooks/useIncomesForm";
import { fmtCurrency } from "../../utils/incomesForm.utils";
import { NewProveedorModal } from "../../../proveedores/components/NewProveedorModal";
import { NewProductoModal } from "../NewProductoModal";
import type { DetalleRow } from "../../types/incomesForm.types";
import type { SaveItemResponseDto } from "../../types/saveItemResponse.types";
import { ImeisModal } from "./ImeisModal";
import { imeisCompletos } from "../../utils/incomesForm.utils";

// ── Helper: selecciona todo al hacer focus ────────────────────────────────────

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  e.target.select();

// ── Primitivas de campo ───────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="su-field-label pl-1">{children}</label>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      onFocus={(e) => {
        selectOnFocus(e);
        props.onFocus?.(e);
      }}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full
                 placeholder:text-[var(--su-text-subtle)] disabled:opacity-40"
      style={{ color: "var(--foreground)" }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full disabled:opacity-40"
      style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      onFocus={(e) => {
        selectOnFocus(e);
        props.onFocus?.(e);
      }}
      rows={8}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full resize-none
                 placeholder:text-[var(--su-text-subtle)]"
      style={{ color: "var(--foreground)" }}
    />
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                 transition-colors duration-200 focus:outline-none"
      style={{
        background: checked
          ? "linear-gradient(135deg, var(--brand-blue), var(--brand-sky))"
          : "var(--su-bg-deep)",
        boxShadow: checked ? "var(--su-shadow-brand)" : "var(--su-shadow-inset)",
        border: "1px solid var(--su-border)",
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5"
        style={{ transform: checked ? "translateX(22px)" : "translateX(3px)" }}
      />
    </button>
  );
}

// ── Cabecera de tabla ─────────────────────────────────────────────────────────

const COL_TEMPLATE = "1fr 80px 100px 100px 90px 110px 100px 48px";
const COL_HEADERS = [
  { label: "Producto" },
  { label: "Cant.", align: "right" as const },
  { label: "Costo Unit.", align: "right" as const },
  { label: "Desc. Fila", align: "right" as const },
  { label: "Subtotal", align: "right" as const },
  { label: "PVP Sugerido", align: "right" as const },
  { label: "Aplicar PVP", align: "center" as const },
  { label: "" },
];

function TableHeader() {
  return (
    <div
      className="grid items-center gap-3 px-4 py-2 rounded-t-2xl"
      style={{ gridTemplateColumns: COL_TEMPLATE, background: "var(--su-bg-deep)" }}
    >
      {COL_HEADERS.map(({ label, align }, i) => (
        <span key={i} className="su-field-label" style={{ textAlign: align ?? "left" }}>
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Input de tabla ────────────────────────────────────────────────────────────

function TableInput(props: React.InputHTMLAttributes<HTMLInputElement> & { extraClass?: string }) {
  const { extraClass, ...rest } = props;
  return (
    <input
      {...rest}
      onFocus={(e) => {
        selectOnFocus(e);
        rest.onFocus?.(e);
      }}
      className={`su-inset rounded-xl px-2 py-1.5 text-sm outline-none w-full tabular-nums ${extraClass ?? ""}`}
      style={{ color: "var(--foreground)" }}
    />
  );
}

// ── Fila de detalle ───────────────────────────────────────────────────────────

function DetalleRowUI({
  row,
  onUpdate,
  onRemove,
  onOpenImeis,           // ← faltaba
}: {
  row: DetalleRow;
  onUpdate: (campo: keyof DetalleRow, valor: number | boolean) => void;
  onRemove: () => void;
  onOpenImeis: () => void;   // ← faltaba
}) {
  const completos = imeisCompletos(row);   // ← faltaba

  return (
    <div
      className="grid items-center gap-3 px-4 py-2.5 border-t"
      style={{ gridTemplateColumns: COL_TEMPLATE, borderColor: "var(--su-border)" }}
    >
      <div className="min-w-0">
        <p className="text-sm truncate font-medium" style={{ color: "var(--foreground)" }}>
          {row.nombre_visual}
        </p>
{row.require_imei && (
          <button
            type="button"
            onClick={onOpenImeis}
            className="text-[11px] font-semibold mt-0.5 flex items-center gap-1"
            style={{ color: completos ? "var(--brand-blue)" : "#dc2626" }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 5h14v14H5z" />
            </svg>
            {row.imeis.filter((v) => v.trim()).length === 0
              ? "Cargar IMEI"
              : `${row.imeis.filter((v) => v.trim()).length} IMEI${row.imeis.filter((v) => v.trim()).length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Cantidad */}
      <NumericInput
        min={1}
        max={row.require_imei ? 1 : undefined}
        value={row.cantidad}
        disabled={row.require_imei}
        className="su-inset rounded-xl px-2 py-1.5 text-sm outline-none w-full tabular-nums text-right
                   disabled:opacity-60"
        onChange={(valor) => onUpdate("cantidad", valor)}
      />

      {/* Costo unitario */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: "var(--su-text-muted)" }}
        >
          $
        </span>
        <NumericInput
          min={0}
          step={0.01}
          value={row.costo_unitario}
          className="su-inset rounded-xl px-2 py-1.5 text-sm outline-none w-full tabular-nums pl-6 pr-2 text-right"
          onChange={(valor) => onUpdate("costo_unitario", valor)}
        />
      </div>

      {/* Descuento línea */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: "var(--su-text-muted)" }}
        >
          $
        </span>
        <NumericInput
          min={0}
          step={0.01}
          value={row.descuento_linea}
          className="su-inset rounded-xl px-2 py-1.5 text-sm outline-none w-full tabular-nums pl-6 pr-2 text-right"
          onChange={(valor) => onUpdate("descuento_linea", valor)}
        />
      </div>

      {/* Subtotal (solo lectura) */}
      <p className="text-sm font-bold text-right tabular-nums" style={{ color: "var(--su-text)" }}>
        {fmtCurrency(row.subtotal_linea)}
      </p>

      {/* PVP sugerido */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: "var(--su-text-muted)" }}
        >
          $
        </span>
        <NumericInput
          min={0}
          step={0.01}
          value={row.precio_venta_sugerido}
          className="su-inset rounded-xl px-2 py-1.5 text-sm outline-none w-full tabular-nums pl-6 pr-2 text-right"
          onChange={(valor) => onUpdate("precio_venta_sugerido", valor)}
        />
      </div>

      {/* Toggle aplicar PVP */}
      <div className="flex justify-center">
        <Toggle checked={row.aplicar_pvp} onChange={(v) => onUpdate("aplicar_pvp", v)} />
      </div>

      {/* Eliminar */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onRemove}
          className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
          aria-label="Eliminar fila"
          title="Eliminar"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: "#dc2626" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Icono "+" ─────────────────────────────────────────────────────────────────

function AddButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
                 transition-all duration-150 hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg, var(--brand-blue), var(--brand-sky))",
        boxShadow: "var(--su-shadow-brand)",
        color: "#fff",
      }}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function IncomesForm() {
  const [proveedorModalOpen, setProveedorModalOpen] = useState(false);
  const [productoModalOpen, setProductoModalOpen] = useState(false);

  const {
    newData,
    proveedores,
    productosDB,
    form,
    patch,
    loadingInitial,
    submitting,
    formInvalid,
    buscarProveedores,
    onProveedorSeleccionado,
    onProveedorBorrado,
    onProveedorCreado,
    buscarProductos,
    agregarProducto,
    actualizarDetalle,
    actualizarImeis,
    removerDetalle,
    onSubmit,
  } = useIncomesForm();
  const [imeiModalItemId, setImeiModalItemId] = useState<string | null>(null);
  // ── Cuando se crea un producto desde el modal ─────────────────────────────
  function onProductoCreado(result: SaveItemResponseDto) {
    if (result.es_servicio) return; // servicios no van a la tabla de ingreso
    agregarProducto({
      id: result.id,
      name: result.name,
      precio_actual: result.precio_actual,
      require_imei: result.require_imei,
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-[1400px] mx-auto">

      <h1 className="text-xl font-bold text-center" style={{ color: "var(--su-text)" }}>
        Ingreso de Mercadería
      </h1>

      {loadingInitial ? (
        <div className="flex h-64 items-center justify-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--brand-blue)", borderTopColor: "transparent" }}
          />
          <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
            Cargando datos…
          </span>
        </div>
      ) : (
        <>
          {/* ── Sección: Proveedor + Documento ── */}
          <div className="su-surface-md rounded-3xl p-5 flex flex-col gap-5">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--su-text-muted)" }}
            >
              Datos del documento
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* Proveedor + botón "+" */}
              <div className="lg:col-span-2">
                <div className="flex items-end gap-2 mt-1.5">
                  <div className="flex-1 min-w-0">
                    <GenericSelector
                      label="Proveedor"
                      placeholder="Buscar por nombre o RUC…"
                      options={proveedores}
                      onSearch={buscarProveedores}
                      value={proveedores.find((p) => p.id === form.proveedor_id) ?? null}
                      onSelect={(item) =>
                        item ? onProveedorSeleccionado(item) : onProveedorBorrado()
                      }
                    />
                  </div>
                  <AddButton onClick={() => setProveedorModalOpen(true)} title="Nuevo proveedor" />
                </div>
              </div>

              {/* Tipo documento */}
              <Field label="Tipo Documento">
                <Select
                  value={form.tipo_doc_id ?? ""}
                  onChange={(e) =>
                    patch({ tipo_doc_id: e.target.value ? Number(e.target.value) : null })
                  }
                >
                  <option value="">Seleccione…</option>
                  {newData.tiposDocumento.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </Field>

              {/* N° Documento */}
              <Field label="N° Documento">
                <Input
                  value={form.compra_numero_documento}
                  placeholder="001-001-000000123"
                  onChange={(e) => patch({ compra_numero_documento: e.target.value })}
                />
              </Field>

              {/* Fecha */}
              <Field label="Fecha Emisión">
                <Input
                  type="date"
                  value={form.compra_fecha_emision}
                  onChange={(e) => patch({ compra_fecha_emision: e.target.value })}
                />
              </Field>

              {/* Estado de pago */}
              <Field label="Estado de Pago">
                <Select
                  value={form.estado_pago_id ?? ""}
                  onChange={(e) =>
                    patch({ estado_pago_id: e.target.value ? Number(e.target.value) : null })
                  }
                >
                  <option value="">Seleccione…</option>
                  {newData.estadosPago.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </Select>
              </Field>

            </div>
          </div>

          {/* ── Sección: Añadir ítems ── */}
          <div className="su-surface-md rounded-3xl p-5 flex flex-col gap-4">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--su-text-muted)" }}
            >
              Añadir ítems
            </p>

            {/* Buscador + botón nuevo producto */}
            <div className="max-w-md">
              <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                  <GenericSelector
                    label="Buscar Producto"
                    placeholder="Código, nombre, marca o modelo…"
                    options={productosDB}
                    onSearch={buscarProductos}
                    onSelect={(item) => {
                      if (item) {
                        const prod = productosDB.find((p) => p.id === item.id);
                        if (prod) agregarProducto(prod);
                      }
                    }}
                  />
                </div>
                <AddButton onClick={() => setProductoModalOpen(true)} title="Nuevo producto" />
              </div>
            </div>

            {form.detalles.length > 0 ? (
              <div className="su-surface rounded-2xl overflow-hidden mt-2">
                <TableHeader />
{form.detalles.map((row) => (
  <DetalleRowUI
    key={row.row_id}                     // ← antes: row.item_id
    row={row}
    onUpdate={(campo, valor) =>
      actualizarDetalle(row.row_id, { [campo]: valor })   // ← antes: row.item_id
    }
    onRemove={() => removerDetalle(row.row_id)}           // ← antes: row.item_id
    onOpenImeis={() => setImeiModalItemId(row.row_id)}    // ← este ya lo tenías bien
  />
))}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center h-36 gap-2 rounded-2xl"
                style={{ background: "var(--su-bg-deep)" }}
              >
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                  style={{ color: "var(--su-text-subtle)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
                <p className="text-sm" style={{ color: "var(--su-text-muted)" }}>
                  No hay productos agregados
                </p>
                <span className="text-xs" style={{ color: "var(--su-text-subtle)" }}>
                  Usa el buscador de arriba para añadir ítems
                </span>
              </div>
            )}
          </div>

          {/* ── Sección: Observaciones + Totales ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

            <div className="su-surface-md rounded-3xl p-5">
              <Field label="Observaciones">
                <Textarea
                  value={form.observaciones}
                  placeholder="Estado del envío, detalles del proveedor…"
                  onChange={(e) => patch({ observaciones: e.target.value })}
                />
              </Field>
              <p className="text-[11px] mt-1.5 pl-1" style={{ color: "var(--su-text-subtle)" }}>
                Notas internas sobre esta compra
              </p>
            </div>

            <div className="su-surface-md rounded-3xl p-5 flex flex-col gap-3">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--su-text-muted)" }}
              >
                Totales
              </p>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
                  Subtotal ítems:
                </span>
                <span className="text-sm font-bold tabular-nums" style={{ color: "var(--foreground)" }}>
                  {fmtCurrency(form.compra_subtotal)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Desc. Global">
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--su-text-muted)" }}
                    >
                      $
                    </span>
                    <NumericInput
                      min={0}
                      step={0.01}
                      value={form.compra_descuento_global}
                      onChange={(valor) => patch({ compra_descuento_global: valor })}
                      className="su-inset rounded-2xl pl-6 pr-3 py-2.5 text-sm outline-none w-full text-right tabular-nums"
                    />
                  </div>
                </Field>
                <Field label="% IVA">
                  <div className="relative">
                    <NumericInput
                      min={0}
                      max={100}
                      value={form.compra_porcentaje_impuesto}
                      onChange={(valor) =>
                        patch({ compra_porcentaje_impuesto: valor })
                      }
                      className="su-inset rounded-2xl px-3 pr-7 py-2.5 text-sm outline-none w-full text-right tabular-nums"
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--su-text-muted)" }}
                    >
                      %
                    </span>
                  </div>
                </Field>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "var(--su-text-muted)" }}>
                  IVA calculado:
                </span>
                <span className="text-xs tabular-nums" style={{ color: "var(--su-text-muted)" }}>
                  {fmtCurrency(form.compra_valor_impuesto)}
                </span>
              </div>

              <Field label="Gastos de Envío">
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                    style={{ color: "var(--su-text-muted)" }}
                  >
                    $
                  </span>
                  <NumericInput
                    min={0}
                    step={0.01}
                    value={form.compra_gastos_envio}
                    onChange={(valor) => patch({ compra_gastos_envio: valor })}
                    className="su-inset rounded-2xl pl-6 pr-3 py-2.5 text-sm outline-none w-full text-right tabular-nums"
                  />
                </div>
              </Field>

              <div className="su-divider" />

              <div className="flex justify-between items-center">
                <span
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: "var(--su-text)" }}
                >
                  Total Factura:
                </span>
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{ color: "var(--brand-blue)" }}
                >
                  {fmtCurrency(form.compra_total_pagar)}
                </span>
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || formInvalid}
                className="su-brand w-full rounded-2xl py-3 text-sm font-bold mt-1
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-150 hover:shadow-[var(--su-shadow-brand-lg)]
                           flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30
                                 border-t-white animate-spin"
                    />
                    Procesando…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Procesar Ingreso a Stock
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Modal: Nuevo Proveedor ── */}
      {proveedorModalOpen && (
        <NewProveedorModal
          onClose={(result) => {
            if (result) onProveedorCreado(result);
            setProveedorModalOpen(false);
          }}
        />
      )}

      {/* ── Modal: Nuevo Producto ── */}
      {productoModalOpen && (
        <NewProductoModal
          onClose={(result) => {
            if (result) onProductoCreado(result);
            setProductoModalOpen(false);
          }}
        />
      )}
      {/* ── Modal: IMEIs ── */}
{/* ── Modal: IMEIs ── */}
{imeiModalItemId !== null && (() => {
  const row = form.detalles.find((d) => d.row_id === imeiModalItemId); // ← antes: d.item_id
  if (!row) return null;
  return (
    <ImeisModal
      productoNombre={row.nombre_visual}
      minImeis={1}
      maxImeis={2}
      imeisIniciales={row.imeis}
      onClose={() => setImeiModalItemId(null)}
      onSave={(imeis) => {
        actualizarImeis(row.row_id, imeis); // ← antes: row.item_id
        setImeiModalItemId(null);
      }}
    />
  );
})()}
    </div>
  );
}