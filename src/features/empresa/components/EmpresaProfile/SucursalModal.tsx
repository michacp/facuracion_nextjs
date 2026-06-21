"use client";

import { X } from "lucide-react";
import { useSucursalModal } from "../../hooks/useSucursalModal";
import { Sucursal } from "../../types/empresa.types";

interface SucursalModalProps {
    isOpen: boolean;
    /** null = crear, objeto = editar */
    sucursal: Sucursal | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function SucursalModal({ isOpen, sucursal, onClose, onSaved }: SucursalModalProps) {
    const { form, setField, saving, error, handleSubmit, isEditing } = useSucursalModal({
        sucursal,
        onSaved,
        onClose,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="su-dropdown w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-su-text">
                        {isEditing ? "Editar sucursal" : "Nueva sucursal"}
                    </h3>
                    <button type="button" onClick={onClose} className="su-icon-btn" aria-label="Cerrar">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Código</span>
                        <input
                            type="text"
                            value={form.sucursales_cod}
                            onChange={(e) => setField("sucursales_cod", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Nombre</span>
                        <input
                            type="text"
                            value={form.sucursales_nombre}
                            onChange={(e) => setField("sucursales_nombre", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Dirección</span>
                        <input
                            type="text"
                            value={form.sucursales_direccion}
                            onChange={(e) => setField("sucursales_direccion", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Teléfono</span>
                        <input
                            type="text"
                            value={form.sucursales_telefono ?? ""}
                            onChange={(e) => setField("sucursales_telefono", e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-foreground/90">
                        <input
                            type="checkbox"
                            checked={!!form.sucursales_esMatriz}
                            onChange={(e) => setField("sucursales_esMatriz", e.target.checked)}
                            disabled={saving}
                        />
                        Es la sucursal matriz
                    </label>

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