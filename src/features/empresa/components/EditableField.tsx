"use client";

import { Check, Pencil, X } from "lucide-react";
import { EmpresaFieldValue } from "../types/empresa.types";

interface SelectOption {
    value: number;
    label: string;
}

interface EditableFieldProps {
    label: string;
    value: EmpresaFieldValue;
    displayValue?: string;
    isEditing: boolean;
    saving: boolean;
    readOnly?: boolean; // ◄ Agregamos readOnly opcional
    type?: "text" | "boolean" | "select";
    options?: SelectOption[];
    onStartEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onChange: (value: EmpresaFieldValue) => void;
}

export default function EditableField({
    label,
    value,
    displayValue,
    isEditing,
    saving,
    readOnly = false, // ◄ Por defecto es false
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
                <div className="flex items-center justify-between gap-3 min-h-[32px]">
                    <span className="text-sm text-foreground/90 truncate">
                        {displayValue ?? String(value)}
                    </span>
                    {/* El botón del lápiz solo se renderiza si NO es readOnly */}
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={onStartEdit}
                            className="su-icon-btn shrink-0"
                            aria-label={`Editar ${label}`}
                        >
                            <Pencil size={14} />
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    {type === "boolean" ? (
                        <select
                            autoFocus
                            value={value ? "true" : "false"}
                            onChange={(e) => onChange(e.target.value === "true")}
                            disabled={saving}
                            className="su-inset flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        >
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    ) : type === "select" && options?.length ? (
                        <select
                            autoFocus
                            value={String(value)}
                            onChange={(e) => onChange(Number(e.target.value))}
                            disabled={saving}
                            className="su-inset flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                        >
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
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