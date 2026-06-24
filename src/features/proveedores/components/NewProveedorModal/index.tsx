"use client";
// src/features/proveedores/components/NewProveedorModal/index.tsx

import { useNewProveedor } from "../../hooks/useNewProveedor";
import type { NewProveedorResult } from "../../types/newProveedor.types";

// ── Primitivas ────────────────────────────────────────────────────────────────

function Field({ label, error, children }: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="su-field-label pl-1">{label}</label>
            {children}
            {error && (
                <p className="text-[11px] pl-1" style={{ color: "#dc2626" }}>{error}</p>
            )}
        </div>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
    const { error, ...rest } = props;
    return (
        <input
            {...rest}
            className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full
                       placeholder:text-[var(--su-text-subtle)] disabled:opacity-40"
            style={{ color: "var(--foreground)", borderColor: error ? "#dc2626" : undefined }}
        />
    );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
    const { error, ...rest } = props;
    return (
        <select
            {...rest}
            className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none w-full disabled:opacity-40"
            style={{ color: "var(--foreground)", background: "var(--su-bg)", borderColor: error ? "#dc2626" : undefined }}
        />
    );
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
    onClose: (result: NewProveedorResult | null) => void;
}

export function NewProveedorModal({ onClose }: Props) {
    const {
        newData, form, patch,
        loadingData, loading,
        guardar, cancelar, fieldError,
    } = useNewProveedor(onClose);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) cancelar(); }}
        >
            <div className="su-surface-lg rounded-3xl w-full max-w-lg flex flex-col
                            max-h-[90vh] overflow-hidden
                            animate-[float-in_0.3s_cubic-bezier(0.34,1.4,0.64,1)_forwards]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="su-brand w-9 h-9 rounded-2xl flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="su-avatar-shine" />
                        </div>
                        <p className="text-base font-bold" style={{ color: "var(--su-text)" }}>
                            Nuevo Proveedor
                        </p>
                    </div>
                    <button onClick={cancelar} className="su-icon-btn w-8 h-8 rounded-xl text-sm">✕</button>
                </div>

                <div className="su-divider mx-6 shrink-0" />

                {/* Body */}
                <div className="overflow-y-auto px-6 py-5">
                    {loadingData ? (
                        <div className="flex h-40 items-center justify-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
                            <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
                                Cargando datos…
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Tipo Identificación" error={fieldError("tipoIdentificacion")}>
                                    <Select
                                        value={form.tipoIdentificacion}
                                        error={!!fieldError("tipoIdentificacion")}
                                        onChange={(e) => patch({ tipoIdentificacion: e.target.value })}
                                    >
                                        <option value="">Seleccione…</option>
                                        {newData.tiposIdentificacion.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field label="Identificación" error={fieldError("identificacion")}>
                                    <Input
                                        value={form.identificacion}
                                        placeholder="RUC / Cédula / Pasaporte"
                                        maxLength={20}
                                        error={!!fieldError("identificacion")}
                                        onChange={(e) => patch({ identificacion: e.target.value })}
                                    />
                                </Field>
                            </div>

                            <Field label="Razón Social" error={fieldError("razonSocial")}>
                                <Input
                                    value={form.razonSocial}
                                    placeholder="Nombre legal completo"
                                    maxLength={150}
                                    error={!!fieldError("razonSocial")}
                                    onChange={(e) => patch({ razonSocial: e.target.value })}
                                />
                            </Field>

                            <Field label="Nombre Comercial (opcional)">
                                <Input
                                    value={form.nombreComercial}
                                    placeholder="Nombre con el que opera"
                                    maxLength={150}
                                    onChange={(e) => patch({ nombreComercial: e.target.value })}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="País" error={fieldError("paisId")}>
                                    <Select
                                        value={form.paisId ?? ""}
                                        error={!!fieldError("paisId")}
                                        onChange={(e) => patch({ paisId: e.target.value ? Number(e.target.value) : null })}
                                    >
                                        <option value="">Seleccione…</option>
                                        {newData.paises.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field label="Teléfono (opcional)">
                                    <Input
                                        value={form.telefono}
                                        placeholder="0991234567"
                                        maxLength={20}
                                        onChange={(e) => patch({ telefono: e.target.value })}
                                    />
                                </Field>
                            </div>

                            <Field label="Email (opcional)" error={fieldError("email")}>
                                <Input
                                    type="email"
                                    value={form.email}
                                    placeholder="proveedor@empresa.com"
                                    maxLength={100}
                                    error={!!fieldError("email")}
                                    onChange={(e) => patch({ email: e.target.value })}
                                />
                            </Field>

                            <Field label="Dirección (opcional)">
                                <Input
                                    value={form.direccion}
                                    placeholder="Av. Principal 123, Ciudad"
                                    maxLength={255}
                                    onChange={(e) => patch({ direccion: e.target.value })}
                                />
                            </Field>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 shrink-0 border-t"
                    style={{ borderColor: "var(--su-border)" }}>
                    <button
                        type="button"
                        onClick={cancelar}
                        disabled={loading}
                        className="su-icon-btn flex-1 rounded-2xl py-2.5 text-sm font-medium
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={guardar}
                        disabled={loading || loadingData}
                        className="su-brand flex-1 rounded-2xl py-2.5 text-sm font-bold
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-all duration-150 hover:shadow-[var(--su-shadow-brand-lg)]
                                   flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Guardando…
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Guardar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}