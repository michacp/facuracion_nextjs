"use client";

import { useState } from "react";
import { KeyRound, User } from "lucide-react";
import EditableField from "../EditableField";
import { useMiPerfil } from "../../hooks/useMiPerfil";
import { MiPerfilEditableField } from "../../types/miPerfil.types";
import { EmpresaFieldValue } from "../../types/empresa.types";
import ChangePasswordModal from "./ChangePasswordModal";

export function MiPerfil() {
    const {
        profile,
        loading,
        editingField,
        draftValue,
        saving,
        setDraftValue,
        startEdit,
        cancelEdit,
        saveEdit,
    } = useMiPerfil();

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-sm text-su-text-muted">Cargando tu perfil…</span>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="su-surface-md rounded-2xl p-6 text-center text-sm text-su-text-muted">
                No se pudo cargar tu perfil.
            </div>
        );
    }

    const field = (name: MiPerfilEditableField) => ({
        isEditing: editingField === name,
        saving: editingField === name && saving,
        value: (editingField === name ? draftValue : profile[name]) as EmpresaFieldValue,
        onStartEdit: () => startEdit(name),
        onCancel: cancelEdit,
        onSave: saveEdit,
        onChange: setDraftValue,
    });

    return (
        <div className="flex flex-col gap-6 pb-10">
            <section className="su-surface-lg rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="su-brand flex h-10 w-10 items-center justify-center rounded-2xl">
                            <User size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-su-text">{profile.nombre}</h2>
                            <p className="text-xs text-su-text-muted">{profile.empresa_nombre}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPasswordModalOpen(true)}
                        className="su-icon-btn flex items-center gap-1.5 px-3 text-xs font-medium"
                    >
                        <KeyRound size={14} />
                        Cambiar contraseña
                    </button>
                </div>

                <div className="su-divider mb-5" />

                <div className="grid gap-5 sm:grid-cols-2">
                    <EditableField label="Nombre completo" {...field("nombre")} />
                    <EditableField label="Correo electrónico" {...field("email")} />

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Usuario</span>
                        <p className="text-sm text-foreground/70">{profile.username}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Rol</span>
                        <p className="text-sm text-foreground/70">{profile.rol}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Código emisor</span>
                        <p className="text-sm text-foreground/70">{profile.cod_emisor}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Estado</span>
                        <span
                            className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                profile.activo ? "text-emerald-600 bg-emerald-600/10" : "text-red-600 bg-red-600/10"
                            }`}
                        >
                            {profile.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                </div>
            </section>

            <ChangePasswordModal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
        </div>
    );
}