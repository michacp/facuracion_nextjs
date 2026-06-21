"use client";

import { X } from "lucide-react";
import { useChangePassword } from "../../hooks/useChangePassword";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const {
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
    } = useChangePassword(onClose);

    if (!isOpen) return null;

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="su-dropdown w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-su-text">Cambiar contraseña</h3>
                    <button type="button" onClick={handleClose} className="su-icon-btn" aria-label="Cerrar">
                        <X size={14} />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Contraseña actual</span>
                        <input
                            type="password"
                            value={passwordActual}
                            onChange={(e) => setPasswordActual(e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Contraseña nueva</span>
                        <input
                            type="password"
                            value={passwordNuevo}
                            onChange={(e) => setPasswordNuevo(e.target.value)}
                            disabled={saving}
                            placeholder="Mínimo 6 caracteres"
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">Confirmar contraseña nueva</span>
                        <input
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            disabled={saving}
                            className="su-inset rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    </div>

                    {error && <p className="text-xs text-red-600">{error}</p>}

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={handleClose}
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
                            {saving ? "Guardando…" : "Cambiar contraseña"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}