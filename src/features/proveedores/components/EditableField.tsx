"use client";
// src/features/proveedores/components/EditableField.tsx

import { Check, Pencil, X } from "lucide-react";

export type ProveedorFieldValue = string | number;

interface SelectOption {
    value: number | string;
    label: string;
}

export interface EditableFieldProps {
    label: string;
    value: ProveedorFieldValue;
    displayValue?: string;
    isEditing: boolean;
    saving: boolean;
    type?: "text" | "select";
    options?: SelectOption[];
    onStartEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChange: (value: ProveedorFieldValue) => void;
}

export default function EditableField({
    label,
    value,
    displayValue,
    isEditing,
    saving,
    type = "text",
    options,
    onStartEdit,
    onCancel,
    onSave,
    onChange,
}: EditableFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="su-field-label">{label}</span>

            {!isEditing ? (
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground/90 truncate">
                        {displayValue ?? String(value)}
                    </span>
                    <button
                        type="button"
                        onClick={onStartEdit}
                        className="su-icon-btn shrink-0"
                        aria-label={`Editar ${label}`}
                    >
                        <Pencil size={14} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    {type === "select" && options?.length ? (
                        <select
                            autoFocus
                            value={String(value)}
                            onChange={(e) => {
                                const opt = options.find((o) => String(o.value) === e.target.value);
                                // Devuelve number si el value original era number, string si no
                                onChange(typeof opt?.value === "number" ? Number(e.target.value) : e.target.value);
                            }}
                            disabled={saving}
                            className="su-inset flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        >
                            {options.map((opt) => (
                                <option key={String(opt.value)} value={String(opt.value)}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            autoFocus
                            type="text"
                            value={String(value)}
                            onChange={(e) => onChange(e.target.value)}
                            disabled={saving}
                            className="su-inset flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        />
                    )}

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="su-icon-btn shrink-0 disabled:opacity-60"
                        aria-label="Guardar"
                    >
                        <Check size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="su-icon-btn shrink-0 disabled:opacity-60"
                        aria-label="Cancelar"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}