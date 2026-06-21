"use client";

import { useEffect, useState } from "react";
import { empresaApi } from "../api/empresa.api";
import { SaveSucursalPayload, Sucursal } from "../types/empresa.types";

interface UseSucursalModalProps {
    /** null = crear, objeto = editar */
    sucursal: Sucursal | null;
    onSaved: () => void;
    onClose: () => void;
}

const emptyForm: SaveSucursalPayload = {
    sucursales_cod: "",
    sucursales_nombre: "",
    sucursales_direccion: "",
    sucursales_telefono: "",
    sucursales_esMatriz: false,
};

export function useSucursalModal({ sucursal, onSaved, onClose }: UseSucursalModalProps) {
    const [form, setForm] = useState<SaveSucursalPayload>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Repuebla el formulario cada vez que cambia la sucursal a editar (o se vuelve a crear)
    useEffect(() => {
        if (sucursal) {
            setForm({
                sucursales_id: sucursal.sucursales_id,
                sucursales_cod: sucursal.sucursales_cod,
                sucursales_nombre: sucursal.sucursales_nombre,
                sucursales_direccion: sucursal.sucursales_direccion,
                sucursales_telefono: sucursal.sucursales_telefono ?? "",
                sucursales_esMatriz: sucursal.sucursales_esMatriz,
            });
        } else {
            setForm(emptyForm);
        }
        setError(null);
    }, [sucursal]);

    const setField = <K extends keyof SaveSucursalPayload>(key: K, value: SaveSucursalPayload[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isEditing = !!sucursal;

    const handleSubmit = async () => {
        if (!form.sucursales_cod.trim() || !form.sucursales_nombre.trim() || !form.sucursales_direccion.trim()) {
            setError("Código, nombre y dirección son obligatorios.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await empresaApi.saveSucursal(form);
            onSaved();
            onClose();
        } catch {
            // El interceptor global de axios ya muestra el toast de error
            // (ej. "no se puede eliminar/editar la matriz", límite de sucursales, etc.)
        } finally {
            setSaving(false);
        }
    };

    return { form, setField, saving, error, handleSubmit, isEditing };
}