"use client";
// src/features/clientes/components/EditCustomerModal/index.tsx

import { X, Loader2, UserCheck } from "lucide-react";
import { useEditCustomerModal } from "../../hooks/useEditCustomerModal";
import { CamposAdicionalesSection } from "../CamposAdicionalesSection";
import type { ClienteListItem } from "../../types/clientes.types";

interface Props {
    cliente: ClienteListItem;
    onSuccess: () => void;
    onClose: () => void;
}

export function EditCustomerModal({ cliente, onSuccess, onClose }: Props) {
    const { form, camposArray, loadingDetail, saving, onSubmit } = useEditCustomerModal({
        cliente,
        onSuccess,
        onClose,
    });

    const { register, handleSubmit, formState: { errors } } = form;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="su-surface-lg rounded-2xl w-full max-w-lg mx-4 overflow-hidden animate-[float-in_0.35s_cubic-bezier(0.34,1.4,0.64,1)_forwards] max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--su-border)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="su-brand w-8 h-8 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[var(--foreground)] text-base">Editar Cliente</h2>
                            <p className="text-xs text-su-text-muted font-mono">{cliente.identificacion}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="su-icon-btn rounded-xl">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Loading del detalle */}
                {loadingDetail ? (
                    <div className="flex items-center justify-center gap-3 py-16">
                        <div className="w-5 h-5 rounded-full border-2 animate-spin"
                            style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
                        <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
                            Cargando datos del cliente…
                        </span>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="su-field-label block mb-1.5">
                                        Razón Social / Nombre <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("razonSocial", { required: "Requerido" })}
                                        className="su-inset w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                                    />
                                    {errors.razonSocial && (
                                        <p className="text-red-400 text-xs mt-1">{errors.razonSocial.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="su-field-label block mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        {...register("email", {
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email inválido" },
                                        })}
                                        placeholder="correo@ejemplo.com"
                                        className="su-inset w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                                    />
                                    {errors.email && (
                                        <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="su-field-label block mb-1.5">Teléfono</label>
                                    <input
                                        type="tel"
                                        {...register("telefono")}
                                        placeholder="09XXXXXXXX"
                                        className="su-inset w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="su-field-label block mb-1.5">Dirección</label>
                                    <input
                                        type="text"
                                        {...register("direccion")}
                                        placeholder="Calle, número, ciudad…"
                                        className="su-inset w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                                    />
                                </div>
                            </div>

                            <div className="su-divider" />

                            <CamposAdicionalesSection
                                camposArray={camposArray}
                                register={register}
                                disabled={saving}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--su-border)] shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="su-surface px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--su-text-muted)] hover:text-[var(--su-text)] transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="su-brand px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                {saving ? "Actualizando…" : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}