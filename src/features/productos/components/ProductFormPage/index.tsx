"use client";
import { useState } from "react";
import { GenericChipsSelector } from "../../../../components/common/GenericChipsSelector";
import { GenericSelector } from "../../../../components/common/GenericSelector";
import { useProductForm } from "../../hooks/useProductForm";
import type { SaveItemResponseDto } from "../../types/saveItemResponse.types";
import { ProductoList } from "../../types/product.types";
import { ImeisModal } from "../IncomesForm/ImeisModal";
// ── Props ─────────────────────────────────────────────────────────────────────

interface ProductFormPageProps {
  onSuccess?: (result: SaveItemResponseDto) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponentes
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
      onFocus={(e) => {
        e.target.select();
        props.onFocus?.(e);
      }}
      className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full
                 placeholder:text-[var(--su-text-subtle)]"
      style={{ color: "var(--foreground)" }}
    />
  );
}
// agrega este componente junto a los otros subcomponentes (Field, Input, Select, Textarea)

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

// ── Card últimos productos ────────────────────────────────────────────────────

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


export function ProductFormPage({ onSuccess }: ProductFormPageProps) {
  const {
    marcas, impuestos, tipoItems, modelos, porcentajes,
    ultimosProductos,
    form, patchForm, setImeis,
    selectedImpuestoId,
    esServicio,
    buscarModelos,
    onImpuestoChange,
    onTipoItemChange,
    normalizePrecio,
    normalizeStock,
    onSubmit: _onSubmit,
    loadingInit,
    submitting,
  } = useProductForm();

  const [imeiModalOpen, setImeiModalOpen] = useState(false);

  const stockNum = Number(form.stock) || 0;
  const imeisCargados = (form.imeis ?? []).filter((v) => v.trim()).length;

const formInvalid =
  !form.tipo_item ||
  !form.nombre.trim() ||
  !form.id_tarifa_impuesto ||
  form.modelos_ids.length === 0 ||
  (!esServicio && !!form.require_imei && stockNum === 1 && imeisCargados < 1);

  async function handleSubmit() {
    const result = await _onSubmit();
    if (result && onSuccess) {
      onSuccess(result);
    }
  }

  if (loadingInit) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div
          className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--brand-blue)", borderTopColor: "transparent" }}
        />
        <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
          Cargando formulario…
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 max-w-6xl mx-auto">

      <h2 className="text-xl font-bold text-center" style={{ color: "var(--su-text)" }}>
        Nuevo Producto
      </h2>

      <div className="flex flex-col lg:flex-row gap-6">

        <div className="flex-1 flex flex-col gap-5">

          {/* Fila 1 — Tipo ítem + Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Ítem">
              <Select
                value={form.tipo_item || ""}
                onChange={(e) => onTipoItemChange(Number(e.target.value))}
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
              options={marcas}
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

          {/* Fila 4 — Precio + Stock + Impuesto + Valor impuesto */}
          <div className={`grid grid-cols-2 gap-4 ${esServicio ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
            <Field label="Precio Unitario">
              <Input
                type="number"
                min={0}
                value={form.precio_unitario}
                onChange={(e) => patchForm({ precio_unitario: e.target.value })}
                onBlur={normalizePrecio}
                placeholder="0.00"
              />
            </Field>

            {!esServicio && (
              <Field label="Stock Inicial">
                <Input
                  type="number"
                  min={0}
                  max={form.require_imei ? 1 : undefined}
                  value={form.stock ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    // Si requiere IMEI, no permitir más de 1
                    if (form.require_imei && raw !== "" && Number(raw) > 1) {
                      patchForm({ stock: "1" });
                      return;
                    }
                    patchForm({ stock: raw });
                  }}
                  onBlur={normalizeStock}
                  placeholder="0"
                />
                {form.require_imei && (
                  <p className="text-[11px] mt-1 pl-1" style={{ color: "var(--su-text-subtle)" }}>
                    Máximo 1 unidad — los ítems con IMEI se ingresan de a uno
                  </p>
                )}
              </Field>
            )}

            <Field label="Impuestos">
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
                value={form.id_tarifa_impuesto || ""}
                onChange={(e) =>
                  patchForm({ id_tarifa_impuesto: Number(e.target.value) })
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

          {/* Fila 5 — Requiere IMEI (solo productos) */}
          {!esServicio && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 su-inset rounded-2xl px-4 py-3 w-fit">
                <Toggle
                  checked={!!form.require_imei}
                  onChange={(v) => {
                    const stockActual = Number(form.stock) || 0;
                    patchForm({
                      require_imei: v,
                      stock: v && stockActual > 1 ? "1" : form.stock,
                      imeis: v ? form.imeis : [],
                    });
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Requiere IMEI
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
                    Activa esto para celulares u otros ítems con IMEI único
                  </span>
                </div>
              </div>

              {/* Botón para cargar IMEIs del stock inicial */}
{form.require_imei && stockNum === 1 && (
  <button
    type="button"
    onClick={() => setImeiModalOpen(true)}
    className="text-xs font-semibold flex items-center gap-1.5 w-fit px-3 py-2 rounded-xl su-inset"
    style={{ color: imeisCargados >= 1 ? "var(--brand-blue)" : "#dc2626" }}
  >
    {/* icono */}
    {imeisCargados === 0
      ? "Cargar IMEI"
      : `${imeisCargados} IMEI${imeisCargados > 1 ? "s" : ""} cargado${imeisCargados > 1 ? "s" : ""}`}
  </button>
)}

              {form.require_imei && stockNum === 0 && (
                <p className="text-[11px] pl-1" style={{ color: "var(--su-text-subtle)" }}>
                  Ingresa el stock inicial para poder cargar los IMEIs
                </p>
              )}
            </div>
          )}

          {/* Botón guardar */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSubmit}
              disabled={formInvalid || submitting}
              className="su-brand rounded-2xl px-10 py-3 text-sm font-bold
                         flex items-center gap-2 transition-all duration-150
                         hover:shadow-[var(--su-shadow-brand-lg)]
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting && (
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30
                             border-t-white animate-spin inline-block"
                />
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

      {/* ── Modal: IMEIs del stock inicial ── */}
{imeiModalOpen && (
  <ImeisModal
    productoNombre={form.nombre || "Producto"}
    minImeis={1}
    maxImeis={2}
    imeisIniciales={form.imeis ?? []}
    onClose={() => setImeiModalOpen(false)}
    onSave={(imeis) => {
      setImeis(imeis);
      setImeiModalOpen(false);
    }}
  />
)}
    </div>
  );
}