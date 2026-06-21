"use client";
// src/features/clientes/components/NewCustomerModal/index.tsx

import { X, Loader2, UserCheck } from "lucide-react";
import { useNewCustomerModal } from "../../hooks/useNewCustomerModal";
import { CamposAdicionalesSection } from "../CamposAdicionalesSection";
import type { ClienteCreado } from "../../hooks/useNewCustomerModal";

export type { ClienteCreado };

interface Props {
    onSuccess: (cliente: ClienteCreado) => void;
    onClose: () => void;
}

export function NewCustomerModal({ onSuccess, onClose }: Props) {
    const { form, camposArray, tiposIdentificacion, saving, onSubmit } = useNewCustomerModal({
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
                        <h2 className="font-bold text-[var(--foreground)] text-base">Nuevo Cliente</h2>
                    </div>
                    <button type="button" onClick={onClose} className="su-icon-btn rounded-xl">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form — scroll interno si hay muchos campos adicionales */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                        {/* Datos principales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="su-field-label block mb-1.5">
                                    Tipo de Identificación <span className="text-red-400">*</span>
                                </label>
                                <select
                                    {...register("tipoIdentificacion", { required: "Requerido" })}
                                    className="su-inset w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                                >
                                    <option value="">Seleccione…</option>
                                    {tiposIdentificacion.map((t) => (
                                        <option key={String(t.id)} value={String(t.id)}>{t.name}</option>
                                    ))}
                                </select>
                                {errors.tipoIdentificacion && (
                                    <p className="text-red-400 text-xs mt-1">{errors.tipoIdentificacion.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="su-field-label block mb-1.5">
                                    Identificación <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("identificacion", { required: "Requerido" })}
                                    placeholder="RUC / Cédula / Pasaporte"
                                    className="su-inset w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-indigo)]/30"
                                />
                                {errors.identificacion && (
                                    <p className="text-red-400 text-xs mt-1">{errors.identificacion.message}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="su-field-label block mb-1.5">
                                    Razón Social / Nombre <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("razonSocial", { required: "Requerido" })}
                                    placeholder="Nombre completo o empresa"
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

                        {/* Divider */}
                        <div className="su-divider" />

                        {/* Campos adicionales */}
                        <CamposAdicionalesSection
                            camposArray={camposArray as any}
                            register={register as any}
                            disabled={saving}
                        />
                    </div>

                    {/* Footer fijo */}
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
                            {saving ? "Guardando…" : "Guardar Cliente"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}