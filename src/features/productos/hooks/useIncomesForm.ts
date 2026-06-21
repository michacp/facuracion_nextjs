// src/features/productos/hooks/useIncomesForm.ts
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { comprasApi } from "../api/compras.api";
import { productApi } from "../api/product.api";
import { proveedorApi } from "../api/proveedor.api";
import type {
    DetalleRow,
    IncomesFormState,
    NewDataCompras,
    ProductOption,
    SaveCompraPayload,
    SelectOption,
} from "../types/incomesForm.types";
import {
    calcularSubtotalFila,
    calcularTotales,
    EMPTY_FORM,
    todayISO,
} from "../utils/incomesForm.utils";

export function useIncomesForm() {
    // ── Catálogos ─────────────────────────────────────────────────────────
    const [newData, setNewData] = useState<NewDataCompras>({ tiposDocumento: [], estadosPago: [] });
    const [proveedores, setProveedores] = useState<SelectOption[]>([]);
    const [productosDB, setProductosDB] = useState<ProductOption[]>([]);

    // ── Form ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState<IncomesFormState>(EMPTY_FORM);

    function patch(partial: Partial<IncomesFormState>) {
        setForm((prev) => {
            const next = { ...prev, ...partial };
            // Recalcular totales globales ante cualquier cambio relevante
            const totales = calcularTotales(
                next.detalles,
                next.compra_descuento_global,
                next.compra_porcentaje_impuesto,
                next.compra_gastos_envio
            );
            return { ...next, ...totales };
        });
    }

    // ── UI flags ──────────────────────────────────────────────────────────
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ── Validación ────────────────────────────────────────────────────────
    const formInvalid =
        !form.proveedor_id ||
        !form.tipo_doc_id ||
        !form.estado_pago_id ||
        !form.compra_numero_documento.trim() ||
        !form.compra_fecha_emision ||
        form.detalles.length === 0;

    // ── Carga inicial ─────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            setLoadingInitial(true);
            try {
                const data = await comprasApi.getNewData();
                setNewData(data);

                // Preseleccionar tipo documento = FACTURA
                const factura = data.tiposDocumento.find((t) =>
                    t.name.toUpperCase().includes("FACTURA")
                );
                // Preseleccionar estado pago = PENDIENTE
                const pendiente = data.estadosPago.find((e) =>
                    e.name.toUpperCase() === "PENDIENTE"
                );
                patch({
                    tipo_doc_id: factura?.id ?? null,
                    estado_pago_id: pendiente?.id ?? null,
                });

                // Cargar proveedores y productos en paralelo
                const [provs, prods] = await Promise.all([
                    proveedorApi.find({}),
                    productApi.findForPurchase({}),
                ]);
                setProveedores(provs);
                setProductosDB(prods);
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
                toast.error("Error al cargar datos iniciales");
            } finally {
                setLoadingInitial(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Proveedores ───────────────────────────────────────────────────────
    async function buscarProveedores(search: string) {
        try {
            const res = await proveedorApi.find(search ? { search } : {});
            setProveedores(res);
        } catch (err) {
            console.error("Error buscando proveedores:", err);
        }
    }

    function onProveedorSeleccionado(prov: SelectOption) {
        patch({ proveedor_id: prov.id });
    }

    function onProveedorBorrado() {
        patch({ proveedor_id: null });
        buscarProveedores("");
    }

    function onProveedorCreado(prov: SelectOption) {
        setProveedores((prev) => [prov, ...prev]);
        patch({ proveedor_id: prov.id });
    }

    // ── Productos ─────────────────────────────────────────────────────────
    async function buscarProductos(search: string) {
        try {
            const items = await productApi.findForPurchase(search ? { search } : {});
            setProductosDB(items);
        } catch (err) {
            console.error("Error buscando productos:", err);
        }
    }

    function agregarProducto(prod: ProductOption) {
        const existente = form.detalles.find((d) => d.item_id === prod.id);
        if (existente) {
            actualizarDetalle(prod.id, { cantidad: existente.cantidad + 1 });
            toast.success(`Cantidad de "${prod.name}" incrementada`);
            return;
        }

        const nueva: DetalleRow = {
            item_id: prod.id,
            nombre_visual: prod.name,
            cantidad: 1,
            costo_unitario: 0,
            descuento_linea: 0,
            subtotal_linea: 0,
            precio_venta_sugerido: prod.precio_actual ?? 0,
            aplicar_pvp: false,
        };
        patch({ detalles: [...form.detalles, nueva] });
        toast.success(`"${prod.name}" agregado`);
    }

    function actualizarDetalle(itemId: number, cambios: Partial<DetalleRow>) {
        const detalles = form.detalles.map((d) => {
            if (d.item_id !== itemId) return d;
            const actualizado = { ...d, ...cambios };
            return { ...actualizado, subtotal_linea: calcularSubtotalFila(actualizado) };
        });
        patch({ detalles });
    }

    function removerDetalle(itemId: number) {
        const row = form.detalles.find((d) => d.item_id === itemId);
        patch({ detalles: form.detalles.filter((d) => d.item_id !== itemId) });
        if (row) toast.success(`"${row.nombre_visual}" eliminado`);
    }

    // ── Submit ────────────────────────────────────────────────────────────
    async function onSubmit() {
        if (formInvalid) {
            toast.error("Completa todos los campos requeridos");
            return;
        }

        const payload: SaveCompraPayload = {
            proveedor_id: form.proveedor_id!,
            tipo_doc_id: form.tipo_doc_id!,
            estado_pago_id: form.estado_pago_id!,
            numero_documento: form.compra_numero_documento,
            fecha_emision: form.compra_fecha_emision,
            subtotal: form.compra_subtotal,
            descuento_global: form.compra_descuento_global,
            porcentaje_impuesto: form.compra_porcentaje_impuesto,
            valor_impuesto: form.compra_valor_impuesto,
            gastos_envio: form.compra_gastos_envio,
            total_pagar: form.compra_total_pagar,
            observaciones: form.observaciones || undefined,
            detalles: form.detalles.map((d) => ({
                item_id: d.item_id,
                cantidad: d.cantidad,
                costo_unitario: d.costo_unitario,
                descuento_linea: d.descuento_linea || undefined,
                precio_venta_sugerido: d.precio_venta_sugerido || undefined,
                aplicar_pvp: d.aplicar_pvp,
            })),
        };

        setSubmitting(true);
        try {
            await comprasApi.save(payload);
            toast.success("Ingreso de mercadería procesado");
            resetForm();
        } catch (err) {
            console.error("Error guardando compra:", err);
            toast.error("Error al procesar el ingreso");
        } finally {
            setSubmitting(false);
        }
    }

    function resetForm() {
        setForm({
            ...EMPTY_FORM,
            compra_fecha_emision: todayISO(),
            tipo_doc_id: newData.tiposDocumento.find((t) =>
                t.name.toUpperCase().includes("FACTURA")
            )?.id ?? null,
            estado_pago_id: newData.estadosPago.find((e) =>
                e.name.toUpperCase() === "PENDIENTE"
            )?.id ?? null,
        });
        buscarProductos("");
    }

    return {
        // catálogos
        newData, proveedores, productosDB,
        // form
        form, patch,
        // flags
        loadingInitial, submitting, formInvalid,
        // acciones proveedor
        buscarProveedores, onProveedorSeleccionado,
        onProveedorBorrado, onProveedorCreado,
        // acciones producto
        buscarProductos, agregarProducto,
        actualizarDetalle, removerDetalle,
        // submit
        onSubmit,
    };
}