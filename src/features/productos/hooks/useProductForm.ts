// src/features/productos/hooks/useProductForm.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { productApi } from "../api/product.api";
import {
    Brand, InitialData, Model, Percentaje,
    ProductoList, SaveProductoDto, Tax, TypeItem,
} from "../types/product.types";

// ── Valores iniciales del form ────────────────────────────────────────────────

const EMPTY_FORM: SaveProductoDto = {
    tipo_item: 0,
    nombre: "",
    descripcion: "",
    precio_unitario: 0,
    id_tarifa_impuesto: 0,
    modelos_ids: [],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProductForm() {
    // Catálogos
    const [marcas, setMarcas] = useState<Brand[]>([]);
    const [impuestos, setImpuestos] = useState<Tax[]>([]);
    const [tipoItems, setTipoItems] = useState<TypeItem[]>([]);
    const [modelos, setModelos] = useState<Model[]>([]);
    const [porcentajes, setPorcentajes] = useState<Percentaje[]>([]);

    // Últimos productos
    const [ultimosProductos, setUltimosProductos] = useState<ProductoList[]>([]);

    // Formulario
    const [form, setForm] = useState<SaveProductoDto>(EMPTY_FORM);

    // Control separado para el select de impuesto (como impuestoControl en Angular)
    const [selectedImpuestoId, setSelectedImpuestoId] = useState<number | null>(null);

    // Estados UI
    const [loadingInit, setLoadingInit] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ── Helpers ────────────────────────────────────────────────────────────────

    function patchForm(partial: Partial<SaveProductoDto>) {
        setForm((prev) => ({ ...prev, ...partial }));
    }

    function resetForm(overrides: Partial<SaveProductoDto> = {}) {
        setForm({ ...EMPTY_FORM, ...overrides });
        setModelos([]);
        setSelectedImpuestoId(null);
    }

    // ── Cargar porcentajes por impuesto (onImpuestoSeleccionado) ───────────────

    const loadPorcentajes = useCallback(async (impuestoId: number) => {
        try {
            const data = await productApi.findPercentajes({ id: impuestoId });
            setPorcentajes(data);
            // Preseleccionar "0%" igual que en Angular
            const cero = data.find((p) => p.name === "0%");
            patchForm({ id_tarifa_impuesto: cero?.id ?? 0 });
        } catch (err) {
            console.error("Error fetching porcentajes:", err);
        }
    }, []);

    // ── Cargar datos iniciales (getnewdata) ────────────────────────────────────

    const loadInitialData = useCallback(async () => {
        try {
            const data: InitialData = await productApi.getNewData();
            setImpuestos(data.taxes);
            setMarcas(data.brands);
            setTipoItems(data.type);

            // Preseleccionar IVA
            const iva = data.taxes.find((t) => t.name === "IVA");
            const ivaId = iva?.id ?? null;
            setSelectedImpuestoId(ivaId);
            if (ivaId) await loadPorcentajes(ivaId);

            // Preseleccionar tipo "Producto"
            const tipoProducto = data.type.find((t) => t.name === "Producto");
            patchForm({ tipo_item: tipoProducto?.id ?? 0 });
        } catch (err) {
            console.error("Error fetching initial data:", err);
            toast.error("Error al cargar datos del formulario");
        }
    }, [loadPorcentajes]);

    // ── Últimos 5 productos (last5itemssave) ───────────────────────────────────

    const loadLastProducts = useCallback(async () => {
        try {
            const data = await productApi.last5Saves();
            setUltimosProductos(data);
        } catch (err) {
            console.error("Error fetching last products:", err);
        }
    }, []);

    // ── Init (ngOnInit) ────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            setLoadingInit(true);
            await Promise.all([loadInitialData(), loadLastProducts()]);
            setLoadingInit(false);
        })();
    }, [loadInitialData, loadLastProducts]);

    // ── Buscar modelos por marca (buscarmodelos) ───────────────────────────────

    async function buscarModelos(brandId: number) {
        if (brandId === 0) { setModelos([]); return; }
        try {
            const data = await productApi.findModels({ id: brandId });
            setModelos(data);
            patchForm({ modelos_ids: [] }); // limpiar selección anterior
        } catch (err) {
            console.error("Error fetching models:", err);
        }
    }

    // ── Cambiar impuesto (onImpuestoSeleccionado) ──────────────────────────────

    async function onImpuestoChange(impuestoId: number | null) {
        setSelectedImpuestoId(impuestoId);
        if (impuestoId) await loadPorcentajes(impuestoId);
        else { setPorcentajes([]); patchForm({ id_tarifa_impuesto: 0 }); }
    }

    // ── Submit (onSubmit) ──────────────────────────────────────────────────────

    async function onSubmit() {
        // Validación básica (equivale a productoForm.invalid)
        if (
            !form.tipo_item ||
            !form.nombre.trim() ||
            !form.id_tarifa_impuesto ||
            form.modelos_ids.length === 0
        ) {
            toast.error("Completa todos los campos requeridos");
            return;
        }

        setSubmitting(true);
        try {
            await productApi.save(form);
            await Promise.all([loadInitialData(), loadLastProducts()]);
            resetForm();
        } catch (err) {
            console.error("Error saving product:", err);
            toast.error("Error al guardar el producto");
        } finally {
            setSubmitting(false);
        }
    }

    return {
        // Catálogos
        marcas, impuestos, tipoItems, modelos, porcentajes,
        // Últimos productos
        ultimosProductos,
        // Form state
        form, patchForm,
        selectedImpuestoId,
        // Acciones
        buscarModelos,
        onImpuestoChange,
        onSubmit,
        // UI flags
        loadingInit,
        submitting,
    };
}