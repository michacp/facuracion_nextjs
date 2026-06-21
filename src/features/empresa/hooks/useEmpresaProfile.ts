"use client";

import { useCallback, useEffect, useState } from "react";
import { empresaApi } from "../api/empresa.api";
import {
    EmpresaEditableField,
    EmpresaFieldValue,
    EmpresaProfile,
    EmpresaUpdatePayload,
} from "../types/empresa.types";

export function useEmpresaProfile() {
    const [profile, setProfile] = useState<EmpresaProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Solo un campo editable a la vez (patrón "lápiz → input → check/cancelar")
    const [editingField, setEditingField] = useState<EmpresaEditableField | null>(null);
    const [draftValue, setDraftValue] = useState<EmpresaFieldValue>("");
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async (opts?: { silent?: boolean }) => {
        if (!opts?.silent) setLoading(true);
        try {
            const data = await empresaApi.getProfile();
            setProfile(data);
        } finally {
            if (!opts?.silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const startEdit = (fieldName: EmpresaEditableField) => {
        if (!profile) return;
        setEditingField(fieldName);
        setDraftValue(profile[fieldName] as EmpresaFieldValue);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setDraftValue("");
    };

    const saveEdit = async () => {
        if (!profile || !editingField) return;

        // Si no hubo cambio real respecto al valor original, no llamamos al backend
        const originalValue = profile[editingField] as EmpresaFieldValue;
        if (draftValue === originalValue) {
            cancelEdit();
            return;
        }

        // El backend espera el objeto completo de campos editables (sin RUC)
        const payload: EmpresaUpdatePayload = {
            empresas_razonSocial: profile.empresas_razonSocial,
            empresas_nombreComercial: profile.empresas_nombreComercial,
            empresas_dirMatriz: profile.empresas_dirMatriz,
            empresas_telefono: profile.empresas_telefono,
            empresa_email: profile.empresa_email,
            empresas_obligadocontabilidad: profile.empresas_obligadocontabilidad,
            empresas_agenteRetencion: profile.empresas_agenteRetencion,
            empresas_regimenes_id: profile.empresas_regimenes_id,
            [editingField]: draftValue,
        } as EmpresaUpdatePayload;

        setSaving(true);
        try {
            await empresaApi.update(payload);
            // Reconsulta al backend en vez de pegar el draft localmente,
            // así se refleja cualquier transformación del servidor (ej. mayúsculas)
            await fetchProfile({ silent: true });
            setEditingField(null);
        } finally {
            setSaving(false);
        }
    };

    return {
        profile,
        loading,
        editingField,
        draftValue,
        saving,
        setDraftValue,
        startEdit,
        cancelEdit,
        saveEdit,
        refetch: fetchProfile,
    };
}