// src/features/productos/hooks/useEditProduct.ts
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productApi } from "../api/product.api";
import { Brand, Model, Tax, Percentaje } from "../types/product.types";

export interface Lote {
    lote_id: number;
    numero_lote: string;
    cantidad: number | string; // 👈 permite "" mientras se edita
    fecha_ingreso: string;
}

export interface EditForm {
    id: number;
    nombre: string;
    descripcion: string;
    precio_unitario: number | string;
    id_tarifa_impuesto: number | null;
    modelos_ids: number[];
    lotes: Lote[];
}

export function useEditProduct(productId: number, onClose: (saved: boolean) => void) {

    const [marcas, setMarcas] = useState<Brand[]>([]);
    const [impuestos, setImpuestos] = useState<Tax[]>([]);
    const [modelos, setModelos] = useState<Model[]>([]);
    const [porcentajes, setPorcentajes] = useState<Percentaje[]>([]);

    const [selectedImpuestoId, setSelectedImpuestoId] = useState<number | null>(null);
    const [preselectedModels, setPreselectedModels] = useState<{ id: number; name: string }[]>([]);

    const EMPTY: EditForm = {
        id: productId, nombre: "", descripcion: "",
        precio_unitario: "", id_tarifa_impuesto: null,
        modelos_ids: [], lotes: [],
    };
    const [form, setForm] = useState<EditForm>(EMPTY);

    function patchForm(partial: Partial<EditForm>) {
        setForm((prev) => ({ ...prev, ...partial }));
    }

    const [loadingInit, setLoadingInit] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const formInvalid =
        !form.nombre.trim() ||
        !form.id_tarifa_impuesto ||
        form.modelos_ids.length === 0;

    // ── Carga inicial ─────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            setLoadingInit(true);
            try {
                const catalogos = await productApi.getNewData();
                setMarcas(catalogos.brands);
                setImpuestos(catalogos.taxes);

                const response = await productApi.findOne({ id: productId });

                // Impuesto
                const tipoImpuesto = catalogos.taxes.find(
                    (t) => t.name === response.tarifa_impuesto.tipo_impuesto.nombre
                );
                const idTipoImpuesto = tipoImpuesto?.id ?? null;
                setSelectedImpuestoId(idTipoImpuesto);

                if (idTipoImpuesto) {
                    const pcts = await productApi.findPercentajes({ id: idTipoImpuesto });
                    setPorcentajes(pcts);
                    const tarifa = pcts.find((p) => p.name === response.tarifa_impuesto.tarifa_nombre);
                    patchForm({ id_tarifa_impuesto: tarifa?.id ?? null });
                }

                // Preseleccionados — solo se usan para mostrar chips iniciales
                const presel = response.modelos.map((m: any) => ({
                    id: m.models_id,
                    name: m.models_name,
                }));
                setPreselectedModels(presel);

                // ✅ modelos = presel al inicio (catálogo disponible para el chip selector)
                //    NO causa conflicto porque preselectedModels y availableItems
                //    se setean en el mismo ciclo → GenericChipsSelector los recibe juntos
                setModelos(presel);

                // Lotes
                const lotes: Lote[] = response.lotes.map((l: any) => ({
                    lote_id: l.lote_id,
                    numero_lote: l.numero_lote,
                    cantidad: l.cantidad,
                    fecha_ingreso: l.fecha_ingreso,
                }));

                setForm((prev) => ({
                    ...prev,
                    id: productId,
                    nombre: response.item_nombre,
                    descripcion: response.item_descripcion,
                    precio_unitario: parseFloat(response.item_precio_unitario),
                    modelos_ids: response.modelos.map((m: any) => m.models_id),
                    lotes,
                }));
            } catch (err) {
                console.error("Error cargando producto:", err);
                toast.error("Error al cargar el producto");
            } finally {
                setLoadingInit(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    // ── onImpuestoChange ──────────────────────────────────────────────────────

    async function onImpuestoChange(impuestoId: number | null) {
        setSelectedImpuestoId(impuestoId);
        if (!impuestoId) {
            setPorcentajes([]);
            patchForm({ id_tarifa_impuesto: null });
            return;
        }
        try {
            const pcts = await productApi.findPercentajes({ id: impuestoId });
            setPorcentajes(pcts);
            patchForm({ id_tarifa_impuesto: pcts[0]?.id ?? null });
        } catch (err) {
            console.error("Error cargando porcentajes:", err);
        }
    }

    // ── buscarModelos ─────────────────────────────────────────────────────────

    async function buscarModelos(brand: { id: number; name: string } | null) {
        if (!brand) return;
        try {
            const data = await productApi.findModels({ id: brand.id });
            setModelos(data);

            // ✅ Al cambiar de marca, limpiar preseleccionados — el usuario
            //    está eligiendo una marca nueva, los chips anteriores ya no aplican
            setPreselectedModels([]);

            // Limpiar también los ids seleccionados que ya no existen en el nuevo catálogo
            const disponiblesIds = new Set(data.map((m) => m.id));
            const validos = form.modelos_ids.filter((id) => disponiblesIds.has(id));
            patchForm({ modelos_ids: validos });
        } catch (err) {
            console.error("Error al buscar modelos:", err);
        }
    }

    // ── updateLoteCantidad ────────────────────────────────────────────────────

    // ── updateLoteCantidad ────────────────────────────────────────────────────

    function updateLoteCantidad(index: number, value: string) {
        // Guarda el valor crudo tal cual lo escribe el usuario (permite "" mientras edita)
        const lotes = form.lotes.map((l, i) => (i === index ? { ...l, cantidad: value } : l));
        patchForm({ lotes });
    }

    // Se llama en onBlur: si quedó vacío o inválido, lo deja en 0
    function normalizeLoteCantidad(index: number) {
        const lotes = form.lotes.map((l, i) => {
            if (i !== index) return l;
            const n = Number(l.cantidad);
            return { ...l, cantidad: Number.isFinite(n) && l.cantidad !== "" ? n : 0 };
        });
        patchForm({ lotes });
    }

    // ── onSubmit ──────────────────────────────────────────────────────────────

    async function onSubmit() {
        if (formInvalid) {
            toast.error("Completa todos los campos requeridos");
            return;
        }
        setSubmitting(true);
        try {
            await productApi.updateProduct({
                id: form.id,
                nombre: form.nombre,
                descripcion: form.descripcion,
                precio_unitario: Number(form.precio_unitario),
                id_tarifa_impuesto: form.id_tarifa_impuesto!,
                modelos_ids: form.modelos_ids,
                lotes: form.lotes.map((l) => ({
                    lote_id: l.lote_id,
                    cantidad: Number(l.cantidad) || 0,
                })),
            });
            onClose(true);
        } catch (err) {
            console.error("Error al actualizar:", err);
            toast.error("Error al actualizar el producto");
        } finally {
            setSubmitting(false);
        }
    }

    function cerrar() { onClose(false); }

    return {
        marcas, impuestos, modelos, porcentajes,
        selectedImpuestoId,
        preselectedModels,
        form, patchForm,
        loadingInit, submitting, formInvalid,
        onImpuestoChange,
        buscarModelos,
        updateLoteCantidad,
        normalizeLoteCantidad, // 👈 nuevo
        onSubmit,
        cerrar,
    };
}