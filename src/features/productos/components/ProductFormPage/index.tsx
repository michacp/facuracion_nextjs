// src/features/productos/components/ProductFormPage.tsx
"use client";

import { GenericChipsSelector } from "../../../../components/common/GenericChipsSelector";
import { GenericSelector } from "../../../../components/common/GenericSelector";
import { useProductForm } from "../../hooks/useProductForm";
import { ProductoList } from "../../types/product.types";

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes inline reutilizables (equivalen a mat-form-field)
// ─────────────────────────────────────────────────────────────────────────────

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
                 placeholder:text-[var(--su-text-subtle)]"
      style={{ color: "var(--foreground)" }}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full"
      style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={2}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full resize-none
                 placeholder:text-[var(--su-text-subtle)]"
      style={{ color: "var(--foreground)" }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card de último producto (equivale a mat-card en el panel derecho)
// ─────────────────────────────────────────────────────────────────────────────

function ProductoCard({ producto }: { producto: ProductoList }) {
  return (
    <div className="su-surface rounded-2xl px-4 py-3 flex flex-col gap-1.5">
      <p className="text-sm font-bold truncate" style={{ color: "var(--su-text)" }}>
        {producto.nombre}
      </p>
      <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
        Código: {producto.codigo}
      </p>

      <div className="su-divider my-0.5" />

      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        <InfoRow label="Marca" value={producto.marcas} />
        <InfoRow label="Modelo" value={producto.modelos} />
        <InfoRow label="Precio" value={`$${producto.precio}`} />
        <InfoRow label="Stock" value={String(producto.stock)} />
        <div className="col-span-2">
          <InfoRow label="Impuesto" value={producto.impuesto_nombre} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
      <span className="font-semibold" style={{ color: "var(--foreground)" }}>
        {label}:{" "}
      </span>
      {value}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export function ProductFormPage() {
  const {
    marcas, impuestos, tipoItems, modelos, porcentajes,
    ultimosProductos,
    form, patchForm,
    selectedImpuestoId,
    buscarModelos,
    onImpuestoChange,
    onSubmit,
    loadingInit,
    submitting,
  } = useProductForm();

  // Validación simple para deshabilitar el botón (equivale a productoForm.invalid)
  const formInvalid =
    !form.tipo_item ||
    !form.nombre.trim() ||
    !form.id_tarifa_impuesto ||
    form.modelos_ids.length === 0;

  if (loadingInit) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
        <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
          Cargando formulario…
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-6xl mx-auto">

      {/* Título */}
      <h2 className="text-xl font-bold text-center" style={{ color: "var(--su-text)" }}>
        Nuevo Producto
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Columna izquierda: formulario ── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Fila 1 — Tipo ítem + Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Ítem">
              <Select
                value={form.tipo_item || ""}
                onChange={(e) => patchForm({ tipo_item: Number(e.target.value) })}
              >
                <option value="">Seleccione…</option>
                {tipoItems.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </Field>

            <Field label="Nombre">
              <Input
                value={form.nombre}
                maxLength={200}
                onChange={(e) => patchForm({ nombre: e.target.value })}
                placeholder="Nombre del producto"
              />
            </Field>
          </div>

          {/* Fila 2 — Descripción + Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Descripción">
              <Textarea
                value={form.descripcion}
                maxLength={255}
                onChange={(e) => patchForm({ descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </Field>

<GenericSelector
  label="Marca"
  placeholder="Buscar Marca"
  options={marcas}                          // Brand[] { id, name }
  onSelect={(brand) => buscarModelos(brand?.id ?? 0)}
/>
          </div>

          {/* Fila 3 — Modelos (chips) */}
          <div>
             
 
              <GenericChipsSelector
                availableItems={modelos}
                label="Modelos"
                onSelectionChange={(ids) => patchForm({ modelos_ids: ids })}
              />
 
          </div>

          {/* Fila 4 — Precio + Impuesto + Valor impuesto + Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Precio Unitario">
              <Input
                type="number"
                min={0}
                value={form.precio_unitario || ""}
                onChange={(e) => patchForm({ precio_unitario: Number(e.target.value) })}
                placeholder="0.00"
              />
            </Field>

            <Field label="Impuestos">
              <Select
                value={selectedImpuestoId ?? ""}
                onChange={(e) => onImpuestoChange(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Seleccione…</option>
                {impuestos.map((imp) => (
                  <option key={imp.id} value={imp.id}>{imp.name}</option>
                ))}
              </Select>
            </Field>

            <Field label="Valor de Impuesto">
              <Select
                value={form.id_tarifa_impuesto || ""}
                onChange={(e) => patchForm({ id_tarifa_impuesto: Number(e.target.value) })}
                disabled={porcentajes.length === 0}
              >
                <option value="">Seleccione…</option>
                {porcentajes.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </Field>

 
          </div>

          {/* Botón guardar */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onSubmit}
              disabled={formInvalid || submitting}
              className="su-brand rounded-2xl px-10 py-3 text-sm font-bold
                         flex items-center gap-2 transition-all duration-150
                         hover:shadow-[var(--su-shadow-brand-lg)]
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting && (
                <span className="w-4 h-4 rounded-full border-2 border-white/30
                                 border-t-white animate-spin inline-block" />
              )}
              Guardar Producto
            </button>
          </div>
        </div>

        {/* ── Columna derecha: últimos productos ── */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <h4 className="text-sm font-bold text-center" style={{ color: "var(--su-text)" }}>
            Últimos Productos
          </h4>

          {ultimosProductos.length === 0 ? (
            <p className="text-xs text-center" style={{ color: "var(--su-text-muted)" }}>
              Sin productos recientes
            </p>
          ) : (
            ultimosProductos.map((p, i) => (
              <ProductoCard key={i} producto={p} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}