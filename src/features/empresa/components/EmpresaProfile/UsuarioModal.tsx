"use client";

import { X } from "lucide-react";
import { useRoles } from "../../hooks/useRoles";
import { useUsuarioModal } from "../../hooks/useUsuarioModal";
import { UsuarioEmpresa } from "../../types/empresa.types";

interface UsuarioModalProps {
    isOpen: boolean;
    /** null = crear, objeto = editar */
    usuario: UsuarioEmpresa | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function UsuarioModal({ isOpen, usuario, onClose, onSaved }: UsuarioModalProps) {
    const { roles } = useRoles();
    const { form, setField, saving, error, handleSubmit, isEditing } = useUsuarioModal({
        usuario,
        roles,
        onSaved,
        onClose,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="su-dropdown w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-su-text">
                        {isEditing ? "Editar usuario" : "Agregar usuario"}
                    </h3>
                    <button type="button" onClick={onClose} className="su-icon-btn" aria-label="Cerrar">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Usuario</span>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setField("username", e.target.value)}
                            disabled={saving || isEditing}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Nombre completo</span>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={(e) => setField("nombre", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Correo electrónico</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setField("email", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    {!isEditing && (
                        <div className="flex flex-col gap-1.5">
                            <span className="su-field-label">Contraseña</span>
                            <input
                                type="password"
                                value={form.password ?? ""}
                                onChange={(e) => setField("password", e.target.value)}
                                disabled={saving}
                                placeholder="Mínimo 6 caracteres"
                                className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Rol</span>
                        <select
                            value={form.rol_id || ""}
                            onChange={(e) => setField("rol_id", Number(e.target.value))}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        >
                            <option value="" disabled>
                                Selecciona un rol
                            </option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Código emisor</span>
                        <input
                            type="text"
                            value={form.cod_emisor}
                            onChange={(e) => setField("cod_emisor", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="su-icon-btn px-4 py-2 text-xs font-medium disabled:opacity-60"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="su-brand rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-60"
                        >
                            {saving ? "Guardando…" : "Guardar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}