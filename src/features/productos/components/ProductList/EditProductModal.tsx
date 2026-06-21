// src/features/productos/components/ProductList/EditProductModal.tsx
"use client";

import { GenericSelector }      from "@/components/common/GenericSelector"
import { GenericChipsSelector } from "@/components/common/GenericChipsSelector";
import { useEditProduct }       from "../../hooks/useEditProduct";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  productId: number;
  onClose: (saved: boolean) => void;
}

// ── Subcomponentes de campo (puramente visuales, sin lógica) ──────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="su-field-label pl-1">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full
                 placeholder:text-[var(--su-text-subtle)] disabled:opacity-50"
      style={{ color: "var(--foreground)" }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full disabled:opacity-50"
      style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full resize-none
                 placeholder:text-[var(--su-text-subtle)]"
      style={{ color: "var(--foreground)" }}
    />
  );
}

// ── Componente visual ─────────────────────────────────────────────────────────

export function EditProductModal({ productId, onClose }: Props) {
  const {
    marcas, impuestos, modelos, porcentajes,
    selectedImpuestoId, preselectedModels,
    form, patchForm,
    loadingInit, submitting, formInvalid,
    onImpuestoChange, buscarModelos, updateLoteCantidad,
    onSubmit, cerrar,
  } = useEditProduct(productId, onClose);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
    >
      {/* Panel */}
      <div
        className="su-surface-lg rounded-3xl w-full max-w-2xl flex flex-col
                   max-h-[90vh] overflow-hidden
                   animate-[float-in_0.3s_cubic-bezier(0.34,1.4,0.64,1)_forwards]"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="su-brand w-9 h-9 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
              </svg>
              <span className="su-avatar-shine" />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--su-text)" }}>
                Editar Producto
              </p>
              <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
                ID #{productId}
              </p>
            </div>
          </div>
          <button onClick={cerrar} className="su-icon-btn w-8 h-8 rounded-xl text-sm">✕</button>
        </div>

        <div className="su-divider mx-6 shrink-0" />

        {/* ── Cuerpo scrollable ── */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {loadingInit ? (
            <div className="flex h-48 items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
              <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
                Cargando producto…
              </span>
            </div>
          ) : (
            <>
              {/* Nombre */}
              <Field label="Nombre">
                <Input
                  value={form.nombre}
                  maxLength={200}
                  placeholder="Nombre del producto"
                  onChange={(e) => patchForm({ nombre: e.target.value })}
                />
              </Field>

              {/* Descripción */}
              <Field label="Descripción">
                <Textarea
                  value={form.descripcion}
                  maxLength={255}
                  placeholder="Descripción opcional"
                  onChange={(e) => patchForm({ descripcion: e.target.value })}
                />
              </Field>

              {/* Precio · Impuesto · Valor impuesto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Precio Unitario">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={form.precio_unitario}
                    onChange={(e) => patchForm({ precio_unitario: e.target.value })}
                  />
                </Field>

                <Field label="Impuesto">
                  <Select
                    value={selectedImpuestoId ?? ""}
                    onChange={(e) =>
                      onImpuestoChange(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Seleccione…</option>
                    {impuestos.map((imp) => (
                      <option key={imp.id} value={imp.id}>{imp.name}</option>
                    ))}
                  </Select>
                </Field>

                <Field label="Valor de Impuesto">
                  <Select
                    value={form.id_tarifa_impuesto ?? ""}
                    onChange={(e) =>
                      patchForm({ id_tarifa_impuesto: e.target.value ? Number(e.target.value) : null })
                    }
                    disabled={porcentajes.length === 0}
                  >
                    <option value="">Seleccione…</option>
                    {porcentajes.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              {/* Marca */}
              <GenericSelector
                label="Marca"
                placeholder="Buscar Marca"
                options={marcas}
                onSelect={buscarModelos}
              />

              {/* Modelos */}
              <GenericChipsSelector
                label="Modelos"
                availableItems={modelos}
                preselectedItems={preselectedModels}
                onSelectionChange={(ids) => patchForm({ modelos_ids: ids })}
              />

              {/* ── Lotes ── */}
              {form.lotes.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-bold" style={{ color: "var(--su-text)" }}>
                    Lotes
                  </p>

                  {/* Cabecera lotes */}
                  <div
                    className="grid gap-3 px-4 py-2 rounded-t-2xl border-b"
                    style={{
                      gridTemplateColumns: "1fr 120px 120px",
                      background: "var(--su-bg-deep)",
                      borderColor: "var(--su-divider)",
                    }}
                  >
                    {["Lote", "Cantidad", "Fecha Ingreso"].map((h) => (
                      <span key={h} className="su-field-label text-[11px] uppercase tracking-wider">
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Filas lotes */}
                  <div
                    className="su-surface rounded-b-2xl overflow-hidden divide-y"
                    style={{ borderColor: "var(--su-divider)" }}
                  >
                    {form.lotes.map((lote, i) => (
                      <div
                        key={lote.lote_id}
                        className="grid items-center gap-3 px-4 py-2.5"
                        style={{ gridTemplateColumns: "1fr 120px 120px" }}
                      >
                        <p className="text-xs font-mono truncate"
                          style={{ color: "var(--su-text-muted)" }}>
                          {lote.numero_lote}
                        </p>
                        <input
                          type="number"
                          min={0}
                          value={lote.cantidad}
                          onChange={(e) => updateLoteCantidad(i, Number(e.target.value))}
                          className="su-inset rounded-xl px-3 py-1.5 text-sm outline-none
                                     w-full tabular-nums text-right"
                          style={{ color: "var(--foreground)" }}
                        />
                        <p className="text-xs truncate" style={{ color: "var(--su-text-muted)" }}>
                          {lote.fecha_ingreso}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="flex gap-3 px-6 py-4 shrink-0 border-t"
          style={{ borderColor: "var(--su-divider)" }}
        >
          <button
            onClick={cerrar}
            disabled={submitting}
            className="su-icon-btn flex-1 rounded-2xl py-2.5 text-sm font-medium
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || loadingInit || formInvalid}
            className="su-brand flex-1 rounded-2xl py-2.5 text-sm font-bold
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-150 hover:shadow-[var(--su-shadow-brand-lg)]"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30
                                 border-t-white animate-spin inline-block" />
                Guardando…
              </span>
            ) : "Actualizar Producto"}
          </button>
        </div>
      </div>
    </div>
  );
}