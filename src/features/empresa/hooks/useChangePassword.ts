"use client";

import { useState } from "react";
import { miPerfilApi } from "../api/miPerfil.api";

export function useChangePassword(onSuccess: () => void) {
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNuevo, setPasswordNuevo] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setPasswordActual("");
        setPasswordNuevo("");
        setPasswordConfirm("");
        setError(null);
    };

    const handleSubmit = async () => {
        if (!passwordActual || !passwordNuevo) {
            setError("Completa tu contraseña actual y la nueva.");
            return;
        }
        if (passwordNuevo.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (passwordNuevo !== passwordConfirm) {
            setError("Las contraseñas nuevas no coinciden.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await miPerfilApi.changePassword({ passwordActual, passwordNuevo });
            reset();
            onSuccess();
        } catch {
            // El interceptor global de axios ya muestra el toast de error
            // (ej. "contraseña actual incorrecta")
        } finally {
            setSaving(false);
        }
    };

    return {
        passwordActual,
        setPasswordActual,
        passwordNuevo,
        setPasswordNuevo,
        passwordConfirm,
        setPasswordConfirm,
        saving,
        error,
        handleSubmit,
        reset,
    };
}