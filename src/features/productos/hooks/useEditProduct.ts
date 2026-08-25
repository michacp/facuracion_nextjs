// src/features/productos/hooks/useEditProduct.ts
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { productApi } from "../api/product.api";
import { Brand, Model, Tax, Percentaje } from "../types/product.types";

export interface LoteImei {
    imei: string;
    estado: "DISPONIBLE" | "VENDIDO" | "DEVUELTO";
}

export interface Lote {
    lote_id: number;
    numero_lote: string;
    cantidad: number | string; // 👈 permite "" mientras se edita
    fecha_ingreso: string;
    imeis: LoteImei[];
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

    // Si es true (ej. Cellphone), cada lote representa 1 unidad física con su
    // propio IMEI → el stock del lote no puede ser mayor a 1.
    const [requireImei, setRequireImei] = useState(false);

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
    const [addingLote, setAddingLote] = useState(false); // 👈 nuevo

    const formInvalid =
        !form.nombre.trim() ||
        !form.id_tarifa_impuesto ||
        form.modelos_ids.length === 0;

    // Mapea el shape de lotes que devuelve el backend (findOne / addLote,
    // ambos comparten el mismo FindOneItemResponseDto) al tipo Lote local.
    // Se reutiliza en la carga inicial y después de agregar un lote nuevo.
    function mapLotesFromResponse(lotesResponse: any[]): Lote[] {
        return lotesResponse.map((l: any) => ({
            lote_id: l.lote_id,
            numero_lote: l.numero_lote,
            cantidad: l.cantidad,
            fecha_ingreso: l.fecha_ingreso,
            imeis: l.imeis ?? [],
        }));
    }

    // ── Carga inicial ─────────────────────────────────────────────────────────

    useEffect(() => {
        (async () => {
            setLoadingInit(true);
            try {
                const catalogos = await productApi.getNewData();
                setMarcas(catalogos.brands);
                setImpuestos(catalogos.taxes);

                const response = await productApi.findOne({ id: productId });

                setRequireImei(!!response.require_imei);

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
                setModelos(presel);

                setForm((prev) => ({
                    ...prev,
                    id: productId,
                    nombre: response.item_nombre,
                    descripcion: response.item_descripcion,
                    precio_unitario: parseFloat(response.item_precio_unitario),
                    modelos_ids: response.modelos.map((m: any) => m.models_id),
                    lotes: mapLotesFromResponse(response.lotes),
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
            setPreselectedModels([]);

            const disponiblesIds = new Set(data.map((m) => m.id));
            const validos = form.modelos_ids.filter((id) => disponiblesIds.has(id));
            patchForm({ modelos_ids: validos });
        } catch (err) {
            console.error("Error al buscar modelos:", err);
        }
    }

    // ── updateLoteCantidad ────────────────────────────────────────────────────

    function updateLoteCantidad(index: number, value: string) {
        // Si el ítem requiere IMEI, cada lote es 1 sola unidad física —
        // no tiene sentido (ni es correcto) permitir escribir más de 1.
        let sanitized = value;
        if (requireImei && value !== "") {
            const n = Number(value);
            if (Number.isFinite(n) && n > 1) sanitized = "1";
        }

        const lotes = form.lotes.map((l, i) => (i === index ? { ...l, cantidad: sanitized } : l));
        patchForm({ lotes });
    }

    // Se llama en onBlur: si quedó vacío o inválido, lo deja en 0
    // (o en 0/1 si el ítem requiere IMEI).
    function normalizeLoteCantidad(index: number) {
        const lotes = form.lotes.map((l, i) => {
            if (i !== index) return l;
            let n = Number(l.cantidad);
            if (!Number.isFinite(n) || l.cantidad === "") n = 0;
            if (requireImei && n > 1) n = 1;
            return { ...l, cantidad: n };
        });
        patchForm({ lotes });
    }

    // ── agregarLote ───────────────────────────────────────────────────────────
    // Crea un nuevo lote en el backend (endpoint POST /items/add-lote) y
    // refresca form.lotes con la respuesta completa y actualizada del ítem.
    // No cierra el modal — el usuario sigue editando (ej. luego ajusta el
    // stock del lote recién creado, si no requiere IMEI).
    async function agregarLote(imeis?: string[]) {
        if (requireImei) {
            const limpios = [...new Set((imeis ?? []).map((i) => i.trim()).filter(Boolean))];
            if (limpios.length < 1 || limpios.length > 2) {
                toast.error("Ingresa 1 o 2 IMEIs (2 solo si es dual-SIM)");
                return;
            }
        }

        setAddingLote(true);
        try {
            const response = await productApi.addLote({
                item_id: productId,
                imeis: requireImei ? imeis : undefined,
            });
            patchForm({ lotes: mapLotesFromResponse(response.lotes) });
            toast.success("Lote agregado correctamente");
        } catch (err: any) {
            console.error("Error al agregar lote:", err);
            toast.error(err?.response?.data?.message || "Error al agregar el lote");
        } finally {
            setAddingLote(false);
        }
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
                lotes: form.lotes.map((l) => {
                    let cantidad = Number(l.cantidad) || 0;
                    if (requireImei && cantidad > 1) cantidad = 1;
                    return { lote_id: l.lote_id, cantidad };
                }),
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
        requireImei,
        form, patchForm,
        loadingInit, submitting, formInvalid,
        addingLote, agregarLote, // 👈 nuevo
        onImpuestoChange,
        buscarModelos,
        updateLoteCantidad,
        normalizeLoteCantidad,
        onSubmit,
        cerrar,
    };
}