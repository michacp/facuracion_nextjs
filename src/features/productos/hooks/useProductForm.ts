// src/features/productos/hooks/useProductForm.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { productApi } from "../api/product.api";
import {
    Brand, InitialData, Model, Percentaje,
    ProductoList, SaveProductoDto, Tax, TypeItem,
} from "../types/product.types";
import { SaveItemResponseDto } from "../types/saveItemResponse.types";

// ── Valores iniciales del form ────────────────────────────────────────────────

const EMPTY_FORM: SaveProductoDto = {
    tipo_item: 0,
    nombre: "",
    descripcion: "",
    precio_unitario: "",
    id_tarifa_impuesto: 0,
    modelos_ids: [],
    stock: "",
    require_imei: false,
    imeis: [],
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

    // ── Derivado: ¿el tipo de ítem seleccionado es Servicio? ───────────────────

    const esServicio =
        tipoItems.find((t) => t.id === form.tipo_item)?.name?.toUpperCase() === "SERVICIO";

    // ── Helpers ────────────────────────────────────────────────────────────────

    function patchForm(partial: Partial<SaveProductoDto>) {
        setForm((prev) => ({ ...prev, ...partial }));
    }

    function setImeis(imeis: string[]) {
        patchForm({ imeis });
    }

    function resetForm(overrides: Partial<SaveProductoDto> = {}) {
        setForm({ ...EMPTY_FORM, ...overrides });
        setModelos([]);
        setSelectedImpuestoId(null);
    }

    // ── Normalizar campos numéricos en blur (deja 0 si quedó vacío/ inválido) ──

    function normalizePrecio() {
        setForm((prev) => {
            const n = Number(prev.precio_unitario);
            return { ...prev, precio_unitario: Number.isFinite(n) && prev.precio_unitario !== "" ? n : 0 };
        });
    }

    function normalizeStock() {
        setForm((prev) => {
            const n = Number(prev.stock);
            return { ...prev, stock: Number.isFinite(n) && prev.stock !== "" ? n : 0 };
        });
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

    // ── Cambiar tipo de ítem (onTipoItemChange) ────────────────────────────────
    // Si pasa a Servicio, limpiamos el stock para no arrastrar un valor viejo.

    function onTipoItemChange(tipoItemId: number) {
        const tipo = tipoItems.find((t) => t.id === tipoItemId);
        const nuevoEsServicio = tipo?.name?.toUpperCase() === "SERVICIO";
        patchForm({
            tipo_item: tipoItemId,
            ...(nuevoEsServicio ? { stock: "", require_imei: false, imeis: [] } : {}),
        });
    }

    // ── Submit (onSubmit) ────────────────────────────────────────────────────── 
    async function onSubmit(): Promise<SaveItemResponseDto | null> {
        if (
            !form.tipo_item ||
            !form.nombre.trim() ||
            !form.id_tarifa_impuesto ||
            form.modelos_ids.length === 0
        ) {
            toast.error("Completa todos los campos requeridos");
            return null;
        }

        const stockNum = esServicio ? 0 : (Number(form.stock) || 0);

        // Validación de IMEIs antes de enviar
        if (!esServicio && form.require_imei && stockNum > 0) {
            const imeisLimpios = (form.imeis ?? []).map((i) => i.trim()).filter(Boolean);
            const unicos = new Set(imeisLimpios).size === imeisLimpios.length;

            if (imeisLimpios.length !== stockNum || !unicos) {
                toast.error(`Debes ingresar ${stockNum} IMEIs válidos y únicos para el stock inicial`);
                return null;
            }
        }

        setSubmitting(true);
        try {
            const payload: SaveProductoDto = {
                ...form,
                precio_unitario: Number(form.precio_unitario) || 0,
                stock: esServicio ? undefined : stockNum,
                require_imei: esServicio ? false : !!form.require_imei,
                imeis:
                    !esServicio && form.require_imei && stockNum > 0
                        ? (form.imeis ?? []).map((i) => i.trim()).filter(Boolean)
                        : undefined,
            };
            const result: SaveItemResponseDto = await productApi.save(payload);
            await Promise.all([loadInitialData(), loadLastProducts()]);
            resetForm();
            return result;
        } catch (err) {
            console.error("Error saving product:", err);
            toast.error("Error al guardar el producto");
            return null;
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
        form, patchForm, setImeis,
        selectedImpuestoId,
        esServicio,
        // Acciones
        buscarModelos,
        onImpuestoChange,
        onTipoItemChange,
        normalizePrecio,
        normalizeStock,
        onSubmit,
        // UI flags
        loadingInit,
        submitting,
    };
}