"use client";
// src/features/proveedores/hooks/useProveedorModal.ts

import { useCallback, useEffect, useState } from "react";
import { proveedorListApi } from "../api/proveedor-list.api";
import {
    ProveedorCatalogo,
    ProveedorDetalle,
    ProveedorEditableKey,
    ProveedorUpdatePayload,
} from "../types/proveedor-list.types";
import { ProveedorFieldValue } from "../components/EditableField";

interface Props {
    proveedorId: number;
    onSaved: () => void;
}

export function useProveedorModal({ proveedorId, onSaved }: Props) {
    const [detalle, setDetalle] = useState<ProveedorDetalle | null>(null);
    const [loading, setLoading] = useState(true);

    // Catálogos para los selects
    const [tiposIdentificacion, setTiposIdentificacion] = useState<ProveedorCatalogo[]>([]);
    const [paises, setPaises] = useState<ProveedorCatalogo[]>([]);

    // Edición inline (un campo a la vez)
    const [editingField, setEditingField] = useState<ProveedorEditableKey | null>(null);
    const [draftValue, setDraftValue] = useState<ProveedorFieldValue>("");
    const [saving, setSaving] = useState(false);

    const fetchDetalle = useCallback(async (opts?: { silent?: boolean }) => {
        if (!opts?.silent) setLoading(true);
        try {
            const data = await proveedorListApi.get(proveedorId);
            setDetalle(data);
        } finally {
            if (!opts?.silent) setLoading(false);
        }
    }, [proveedorId]);

    useEffect(() => {
        // Carga en paralelo el detalle y los catálogos
        Promise.all([
            proveedorListApi.get(proveedorId),
            proveedorListApi.getNewData(),
        ]).then(([det, newData]) => {
            setDetalle(det);
            setTiposIdentificacion(newData.tiposIdentificacion);
            setPaises(newData.paises);
        }).finally(() => setLoading(false));
    }, [proveedorId]);

    const startEdit = (field: ProveedorEditableKey) => {
        if (!detalle) return;
        setEditingField(field);

        // Mapeamos del nombre del campo en detalle al del payload de update
        const valueMap: Record<ProveedorEditableKey, ProveedorFieldValue> = {
            identificacion: detalle.identificacion,
            tipoIdentificacion: detalle.tipo_identificacion,
            razonSocial: detalle.razon_social,
            nombreComercial: detalle.nombre_comercial,
            paisId: detalle.pais_id,
            direccion: detalle.direccion,
            telefono: detalle.telefono,
            email: detalle.email,
        };
        setDraftValue(valueMap[field]);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setDraftValue("");
    };

    const saveEdit = async () => {
        if (!detalle || !editingField) return;

        // Valor original para comparar
        const valueMap: Record<ProveedorEditableKey, ProveedorFieldValue> = {
            identificacion: detalle.identificacion,
            tipoIdentificacion: detalle.tipo_identificacion,
            razonSocial: detalle.razon_social,
            nombreComercial: detalle.nombre_comercial,
            paisId: detalle.pais_id,
            direccion: detalle.direccion,
            telefono: detalle.telefono,
            email: detalle.email,
        };

        if (draftValue === valueMap[editingField]) {
            cancelEdit();
            return;
        }

        const payload: ProveedorUpdatePayload = {
            proveedor_id: detalle.proveedor_id,
            identificacion: detalle.identificacion,
            tipoIdentificacion: detalle.tipo_identificacion,
            razonSocial: detalle.razon_social,
            nombreComercial: detalle.nombre_comercial,
            paisId: detalle.pais_id,
            direccion: detalle.direccion,
            telefono: detalle.telefono,
            email: detalle.email,
            [editingField]: draftValue,
        };

        setSaving(true);
        try {
            await proveedorListApi.update(payload);
            // Reconsulta para reflejar normalizaciones del backend
            await fetchDetalle({ silent: true });
            onSaved();
            setEditingField(null);
        } finally {
            setSaving(false);
        }
    };

    return {
        detalle, loading,
        tiposIdentificacion, paises,
        editingField, draftValue, saving,
        setDraftValue, startEdit, cancelEdit, saveEdit,
    };
}