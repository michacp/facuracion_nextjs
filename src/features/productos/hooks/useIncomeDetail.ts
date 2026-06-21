// src/features/productos/components/IncomeDetailModal/useIncomeDetail.ts
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { comprasApi } from "../api/compras.api";
import { productApi } from "../api/product.api";
import { proveedorApi } from "../api/proveedor.api";
import type {
    AddItemForm, CompraDetalle,
    EditableField, SelectOption,
} from "../types/incomeDetailModal.types";

const EMPTY_ADD_ITEM: AddItemForm = {
    item_id: null, nombre_visual: "",
    cantidad: 1, costo_unitario: 0,
    descuento_linea: 0, precio_venta_sugerido: 0,
    aplicar_pvp: false,
};

export function useIncomeDetail(compraId: number, onClose: () => void) {
    const [compra, setCompra] = useState<CompraDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [tiposDocumento, setTiposDocumento] = useState<SelectOption[]>([]);
    const [estadosPago, setEstadosPago] = useState<SelectOption[]>([]);
    const [proveedores, setProveedores] = useState<SelectOption[]>([]);
    const [productosDB, setProductosDB] = useState<{ id: number; name: string; precio_actual: number }[]>([]);

    // Edición inline
    const [editingField, setEditingField] = useState<EditableField>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [savingField, setSavingField] = useState<EditableField>(null);

    // Proveedor
    const [editandoProveedor, setEditandoProveedor] = useState(false);

    // Agregar ítem
    const [mostrarAgregarItem, setMostrarAgregarItem] = useState(false);
    const [addItem, setAddItem] = useState<AddItemForm>(EMPTY_ADD_ITEM);
    const [savingItem, setSavingItem] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // ── Carga ───────────────────────────────────────────────────────────────
    async function loadDetalle() {
        setLoading(true);
        try {
            const res = await comprasApi.getDetail({ compra_id: compraId });
            setCompra(res);
        } catch (err) {
            console.error("Error cargando detalle:", err);
            toast.error("Error al cargar detalle");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDetalle();
        loadCatalogos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compraId]);

    async function loadCatalogos() {
        try {
            const [data, provs, prods] = await Promise.all([
                comprasApi.getNewData(),
                proveedorApi.find({}),
                productApi.findForPurchase({}),
            ]);
            setTiposDocumento(data.tiposDocumento);
            setEstadosPago(data.estadosPago);
            setProveedores(provs);
            setProductosDB(prods);
        } catch (err) {
            console.error("Error cargando catálogos:", err);
        }
    }

    // ── Edición de campos ───────────────────────────────────────────────────
    function startEdit(campo: EditableField, valorActual: string | number | null) {
        setEditingField(campo);
        setEditValue(String(valorActual ?? ""));
        setEditandoProveedor(false);
    }

    function cancelEdit() {
        setEditingField(null);
        setEditValue("");
    }

    async function saveField(campo: EditableField) {
        if (!campo) return;
        setSavingField(campo);
        try {
            await comprasApi.updateField({ compra_id: compraId, campo, valor: editValue });
            setEditingField(null);
            await loadDetalle();
        } catch (err) {
            console.error("Error guardando campo:", err);
            toast.error("Error al guardar");
        } finally {
            setSavingField(null);
        }
    }

    async function saveSelect(campo: EditableField, valor: number | string) {
        setSavingField(campo);
        try {
            await comprasApi.updateField({ compra_id: compraId, campo, valor });
            setEditingField(null);
            await loadDetalle();
        } catch (err) {
            console.error("Error guardando select:", err);
            toast.error("Error al guardar");
        } finally {
            setSavingField(null);
        }
    }

    // ── Proveedor ───────────────────────────────────────────────────────────
    function toggleEditProveedor() {
        setEditandoProveedor((v) => !v);
        setEditingField(null);
    }

    async function buscarProveedores(search: string) {
        try {
            const res = await proveedorApi.find(search ? { search } : {});
            setProveedores(res);
        } catch (err) {
            console.error(err);
        }
    }

    async function onProveedorSeleccionado(prov: SelectOption) {
        setSavingField("proveedor_id" as EditableField);
        try {
            await comprasApi.updateField({ compra_id: compraId, campo: "proveedor_id", valor: prov.id });
            setEditandoProveedor(false);
            await loadDetalle();
        } catch (err) {
            toast.error("Error al cambiar proveedor");
        } finally {
            setSavingField(null);
        }
    }

    // ── Agregar ítem ────────────────────────────────────────────────────────
    async function buscarProductos(search: string) {
        try {
            const items = await productApi.findForPurchase(search ? { search } : {});
            setProductosDB(items);
        } catch (err) {
            console.error(err);
        }
    }

    function onItemSeleccionado(item: { id: number; name: string; precio_actual: number }) {
        setAddItem((prev) => ({
            ...prev,
            item_id: item.id,
            nombre_visual: item.name,
            precio_venta_sugerido: item.precio_actual,
        }));
    }

    function patchAddItem(partial: Partial<AddItemForm>) {
        setAddItem((prev) => ({ ...prev, ...partial }));
    }

    async function guardarNuevoItem() {
        if (!addItem.item_id) return;
        setSavingItem(true);
        try {
            await comprasApi.addItem({
                compra_id: compraId,
                item_id: addItem.item_id,
                cantidad: addItem.cantidad,
                costo_unitario: addItem.costo_unitario,
                descuento_linea: addItem.descuento_linea || undefined,
                precio_venta_sugerido: addItem.precio_venta_sugerido || undefined,
                aplicar_pvp: addItem.aplicar_pvp,
            });
            setMostrarAgregarItem(false);
            setAddItem(EMPTY_ADD_ITEM);
            await loadDetalle();
        } catch (err) {
            toast.error("Error al agregar ítem");
        } finally {
            setSavingItem(false);
        }
    }

    function cancelarAgregarItem() {
        setMostrarAgregarItem(false);
        setAddItem(EMPTY_ADD_ITEM);
    }

    // ── Quitar ítem ─────────────────────────────────────────────────────────
    async function quitarItem(detalleId: number, nombre: string) {
        if (!confirm(`¿Eliminar "${nombre}" de esta compra?\nSi el lote no tiene ventas, el stock se revertirá.`)) return;
        setRemovingId(detalleId);
        try {
            await comprasApi.removeItem({ compra_id: compraId, detalle_id: detalleId });
            await loadDetalle();
        } catch (err) {
            toast.error("Error al eliminar ítem");
        } finally {
            setRemovingId(null);
        }
    }

    return {
        compra, loading,
        tiposDocumento, estadosPago, proveedores, productosDB,
        editingField, editValue, setEditValue, savingField,
        editandoProveedor,
        mostrarAgregarItem, setMostrarAgregarItem,
        addItem, patchAddItem, savingItem, removingId,
        startEdit, cancelEdit, saveField, saveSelect,
        toggleEditProveedor, buscarProveedores, onProveedorSeleccionado,
        buscarProductos, onItemSeleccionado, guardarNuevoItem, cancelarAgregarItem,
        quitarItem,
        cerrar: onClose,
    };
}