"use client";

import { useCallback, useEffect, useState } from "react";
import { miPerfilApi } from "../api/miPerfil.api";
import { MiPerfil, MiPerfilEditableField, MiPerfilUpdatePayload } from "../types/miPerfil.types";
// Reutilizamos el mismo tipo de valor que usa EditableField en EmpresaProfile
import { EmpresaFieldValue } from "../types/empresa.types";

export function useMiPerfil() {
    const [profile, setProfile] = useState<MiPerfil | null>(null);
    const [loading, setLoading] = useState(true);

    const [editingField, setEditingField] = useState<MiPerfilEditableField | null>(null);
    const [draftValue, setDraftValue] = useState<EmpresaFieldValue>("");
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async (opts?: { silent?: boolean }) => {
        if (!opts?.silent) setLoading(true);
        try {
            const data = await miPerfilApi.getProfile();
            setProfile(data);
        } finally {
            if (!opts?.silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const startEdit = (fieldName: MiPerfilEditableField) => {
        if (!profile) return;
        setEditingField(fieldName);
        setDraftValue(profile[fieldName]);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setDraftValue("");
    };

    const saveEdit = async () => {
        if (!profile || !editingField) return;

        // Si no hubo cambio real, no llamamos al backend
        const originalValue = profile[editingField];
        if (draftValue === originalValue) {
            cancelEdit();
            return;
        }

        const payload: MiPerfilUpdatePayload = {
            nombre: profile.nombre,
            email: profile.email,
            [editingField]: draftValue,
        } as MiPerfilUpdatePayload;

        setSaving(true);
        try {
            await miPerfilApi.update(payload);
            // Reconsulta al backend para reflejar cualquier normalización del servidor
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