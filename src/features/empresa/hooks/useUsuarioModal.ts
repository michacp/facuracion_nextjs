"use client";

import { useEffect, useState } from "react";
import { empresaApi } from "../api/empresa.api";
import { Rol, SaveUsuarioPayload, UsuarioEmpresa } from "../types/empresa.types";

interface UseUsuarioModalProps {
    /** null = crear, objeto = editar */
    usuario: UsuarioEmpresa | null;
    roles: Rol[];
    onSaved: () => void;
    onClose: () => void;
}

const emptyForm: SaveUsuarioPayload = {
    username: "",
    nombre: "",
    email: "",
    password: "",
    rol_id: 0,
    cod_emisor: "",
};

export function useUsuarioModal({ usuario, roles, onSaved, onClose }: UseUsuarioModalProps) {
    const [form, setForm] = useState<SaveUsuarioPayload>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (usuario) {
            // El perfil trae el nombre del rol (ej. "ADMIN"), pero el save necesita rol_id.
            // Lo resolvemos buscando en el catálogo por nombre.
            const matchedRole = roles.find((r) => r.name.toUpperCase() === usuario.rol?.toUpperCase());
            setForm({
                usuario_empresa_id: usuario.usuario_empresa_id,
                username: usuario.username,
                nombre: usuario.nombre,
                email: usuario.email,
                rol_id: matchedRole?.id ?? 0,
                cod_emisor: usuario.cod_emisor,
            });
        } else {
            setForm(emptyForm);
        }
        setError(null);
    }, [usuario, roles]);

    const setField = <K extends keyof SaveUsuarioPayload>(key: K, value: SaveUsuarioPayload[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isEditing = !!usuario;

    const handleSubmit = async () => {
        if (!form.username.trim() || !form.nombre.trim() || !form.email.trim() || !form.cod_emisor.trim()) {
            setError("Usuario, nombre, correo y código emisor son obligatorios.");
            return;
        }
        if (!form.rol_id) {
            setError("Selecciona un rol.");
            return;
        }
        if (!isEditing && (!form.password || form.password.length < 6)) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            // Al editar no se reenvía password (queda sin tocar en el backend)
            const payload: SaveUsuarioPayload = isEditing ? { ...form, password: undefined } : form;
            await empresaApi.saveUsuario(payload);
            onSaved();
            onClose();
        } catch {
            // El interceptor global de axios ya muestra el toast de error
            // (ej. "debe existir al menos un administrador", username duplicado, etc.)
        } finally {
            setSaving(false);
        }
    };

    return { form, setField, saving, error, handleSubmit, isEditing };
}