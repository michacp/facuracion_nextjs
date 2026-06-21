// src/features/ventas/components/SaleForm/index.tsx
"use client";

import { useState } from "react";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useSaleForm } from "../../hooks/useSaleForm";
import { ProductosTable } from "./ProductosTable";
import { TotalesPanel } from "./TotalesPanel";
import { Last5SalesPanel } from "./Last5SalesPanel";
import { SaveResultModal } from "./SaveResultModal";
import { GenericSelector } from "@/components/common/GenericSelector";
import { NewCustomerModal } from "@/features/clientes/components/NewCustomerModal";
import type { ClienteCreado } from "@/features/clientes/components/NewCustomerModal";
import type { Item } from "@/components/common/GenericSelector/types";

export function SaleForm() {
  const {
    form,
    fields,
    clientes,
    clientesIniciales,
    productosOpciones,
    productosIniciales,
    impuestos,
    tipocomprobante,
    formadepago,
    last5Sales,
    productosUI,
    saving,
    saveResult,
    setSaveResult,
    loadingTicket,
    loadingA4,
    buscarClientesExplicito,
    buscarProductosExplicito,
    seleccionarCliente,
    agregarProducto,
    eliminarProducto,
    guardarFactura,
    imprimirTicket,
    imprimirA4,
    recalcular,
  } = useSaleForm();

  const { register, formState: { errors } } = form;

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Item | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Item | null>(null);
  const [selectorKey, setSelectorKey] = useState(0);

  const handleClienteCreado = (cliente: ClienteCreado) => {
    const item: Item = {
      id: cliente.id,
      name: cliente.identification
        ? `${cliente.name} — ${cliente.identification}`
        : cliente.name,
    };
    setClienteSeleccionado(item);
    seleccionarCliente(item);
  };

  return (
    <>
      {saveResult && (
        <SaveResultModal result={saveResult} onClose={() => setSaveResult(null)} />
      )}
      {showNewCustomer && (
        <NewCustomerModal
          onSuccess={handleClienteCreado}
          onClose={() => setShowNewCustomer(false)}
        />
      )}

      <div className="flex flex-col gap-6 px-4 py-6 max-w-6xl mx-auto">

        <h2 className="text-xl font-bold text-center" style={{ color: "var(--su-text)" }}>
          Nueva Venta
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Columna principal ─────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* ── Cliente ─────────────────────────────────────────── */}
            <div className="su-surface-md rounded-2xl p-5">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <GenericSelector
                    label="Cliente"
                    placeholder="Buscar por DNI o Razón Social…"
                    options={clientes}
                    initialOptions={clientesIniciales}
                    value={clienteSeleccionado}
                    onSearchExplicit={buscarClientesExplicito}
                    onSelect={(item) => {
                      setClienteSeleccionado(item);
                      seleccionarCliente(item);
                    }}
                  />
                  {errors.clienteId && (
                    <p className="text-red-400 text-xs mt-1 pl-1">
                      El cliente es requerido
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  title="Agregar nuevo cliente"
                  onClick={() => setShowNewCustomer(true)}
                  className="su-icon-btn rounded-xl px-3 py-2.5 mb-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Datos del comprobante ────────────────────────────── */}
            <div className="su-surface-md rounded-2xl p-5">
              <p className="su-field-label mb-4">Datos del Comprobante</p>

              {/* Primera fila: Ahora con 3 columnas en pantallas sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="su-field-label block mb-1.5">Fecha Emisión</label>
                  <input
                    type="date"
                    {...register("fechaEmision", { required: true })}
                    className="su-inset w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  />
                </div>
                <div>
                  <label className="su-field-label block mb-1.5">Tipo Comprobante</label>
                  <select
                    {...register("tipoComprobante", { required: true })}
                    className="su-inset w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  >
                    {tipocomprobante.map((t) => (
                      <option key={String(t.id)} value={String(t.id)}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="su-field-label block mb-1.5">Forma de Pago</label>
                  <select
                    {...register("formaPago", { required: true })}
                    className="su-inset w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  >
                    {formadepago.map((f) => (
                      <option key={String(f.id)} value={String(f.id)}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segunda fila: Ahora incluye Moneda y se ajusta a 3 columnas en pantallas sm+ */}
              {/* Segunda fila: Moneda y Plazo ocupan 25% cada uno, Observaciones ocupa el 50% */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="su-field-label block mb-1.5">Moneda</label>
                  <select
                    {...register("moneda")}
                    className="su-inset w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  >
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="su-field-label block mb-1.5">Plazo de Pago</label>
                  <input
                    type="text"
                    {...register("plazoPago")}
                    placeholder="Ej: 30 días"
                    className="su-inset w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  />
                </div>

                {/* col-span-2 hace que ocupe la mitad de las 4 columnas en sm+ y el ancho completo en móvil */}
                <div className="col-span-2">
                  <label className="su-field-label block mb-1.5">Observaciones</label>
                  <input
                    type="text"
                    {...register("observaciones")}
                    className="su-inset w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                  />
                </div>
              </div>
            </div>

            {/* ── Productos ────────────────────────────────────────── */}
            <div className="su-surface-md rounded-2xl p-5 flex flex-col gap-6">
              <GenericSelector
                key={selectorKey}
                label="Agregar Producto / Servicio"
                placeholder="Buscar producto por nombre…"
                options={productosOpciones}
                initialOptions={productosIniciales}
                value={productoSeleccionado}
                onSearchExplicit={buscarProductosExplicito}
                onSelect={(item) => {
                  agregarProducto(item);
                  setSelectorKey(k => k + 1);
                }}
              />

              <ProductosTable
                form={form}
                fields={fields}
                productosUI={productosUI}
                impuestos={impuestos}
                onEliminar={eliminarProducto}
                onCambio={recalcular}
              />

              <TotalesPanel form={form} />
            </div>

            {/* ── Guardar ──────────────────────────────────────────── */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={guardarFactura}
                disabled={saving}
                className="su-brand px-8 p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap w-fit disabled:opacity-60 transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Guardando…" : "Guardar Factura"}
              </button>
            </div>
          </div>

          {/* ── Panel lateral ─────────────────────────────────────── */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-center" style={{ color: "var(--su-text)" }}>
              Últimas 5 Ventas
            </h4>
            <Last5SalesPanel
              sales={last5Sales}
              loadingTicket={loadingTicket}
              loadingA4={loadingA4}
              onPrintTicket={imprimirTicket}
              onPrintA4={imprimirA4}
            />
          </div>

        </div>
      </div>
    </>
  );
}