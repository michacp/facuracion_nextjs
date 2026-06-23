"use client";
// src/features/proveedores/components/ProveedorModal/index.tsx

import { X, Building2 } from "lucide-react";
import EditableField from "../EditableField";
import type { ProveedorFieldValue } from "../EditableField";
import { useProveedorModal } from "../../hooks/useProveedorModal";
import { ProveedorEditableKey } from "../../types/proveedor-list.types";

interface Props {
    proveedorId: number;
    onClose:     () => void;
    onSaved:     () => void;
}

export function ProveedorModal({ proveedorId, onClose, onSaved }: Props) {
    const {
        detalle, loading,
        tiposIdentificacion, paises,
        editingField, draftValue, saving,
        setDraftValue, startEdit, cancelEdit, saveEdit,
    } = useProveedorModal({ proveedorId, onSaved });

    // Helper para construir las props de cada EditableField
    const field = (name: ProveedorEditableKey) => ({
        isEditing:   editingField === name,
        saving:      editingField === name && saving,
        value:       (editingField === name ? draftValue : "") as ProveedorFieldValue,
        onStartEdit: () => startEdit(name),
        onCancel:    cancelEdit,
        onSave:      saveEdit,
        onChange:    setDraftValue,
    });

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
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[var(--foreground)] text-base">
                                {loading ? "Cargando…" : detalle?.razon_social}
                            </h2>
                            {detalle && (
                                <p className="text-xs text-su-text-muted font-mono">{detalle.identificacion}</p>
                            )}
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="su-icon-btn rounded-xl">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-16">
                            <div className="w-5 h-5 rounded-full border-2 animate-spin"
                                style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
                            <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>
                                Cargando datos del proveedor…
                            </span>
                        </div>
                    ) : detalle ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <EditableField
                                label="Tipo de identificación"
                                type="select"
                                options={tiposIdentificacion.map((t) => ({
                                    value: t.id,
                                    label: t.name,
                                }))}
                                displayValue={detalle.tipo_identificacion_nombre}
                                {...field("tipoIdentificacion")}
                            />

                            <EditableField
                                label="Identificación"
                                displayValue={detalle.identificacion}
                                {...field("identificacion")}
                            />

                            <div className="sm:col-span-2">
                                <EditableField
                                    label="Razón social"
                                    displayValue={detalle.razon_social}
                                    {...field("razonSocial")}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <EditableField
                                    label="Nombre comercial"
                                    displayValue={detalle.nombre_comercial}
                                    {...field("nombreComercial")}
                                />
                            </div>

                            <EditableField
                                label="País"
                                type="select"
                                options={paises.map((p) => ({
                                    value: p.id,
                                    label: p.name,
                                }))}
                                displayValue={detalle.pais_nombre}
                                {...field("paisId")}
                            />

                            <EditableField
                                label="Teléfono"
                                displayValue={detalle.telefono}
                                {...field("telefono")}
                            />

                            <div className="sm:col-span-2">
                                <EditableField
                                    label="Correo electrónico"
                                    displayValue={detalle.email}
                                    {...field("email")}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <EditableField
                                    label="Dirección"
                                    displayValue={detalle.direccion}
                                    {...field("direccion")}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-su-text-muted text-center py-10">
                            No se pudo cargar el proveedor.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--su-border)] shrink-0 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="su-surface px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--su-text-muted)] hover:text-[var(--su-text)] transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}