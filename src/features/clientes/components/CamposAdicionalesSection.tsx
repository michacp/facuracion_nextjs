"use client";
// src/features/clientes/components/CamposAdicionalesSection.tsx

import { Plus, Trash2 } from "lucide-react";

interface CamposAdicionalesSectionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    camposArray: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: any;
    disabled?: boolean;
}

export function CamposAdicionalesSection({
    camposArray,
    register,
    disabled = false,
}: CamposAdicionalesSectionProps) {
    const { fields, append, remove } = camposArray;

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
                <span className="su-field-label">Campos adicionales</span>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => append({ clave: "", valor: "" })}
                    className="su-icon-btn flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium disabled:opacity-60"
                >
                    <Plus size={12} /> Agregar campo
                </button>
            </div>

            {fields.length === 0 && (
                <p className="text-xs text-su-text-subtle pl-0.5">
                    Sin campos adicionales. Usa "Agregar campo" para añadir información extra.
                </p>
            )}

            {fields.map((field:any, index:any) => (
                <div key={field.id} className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Clave"
                        disabled={disabled}
                        {...register(`camposAdicionales.${index}.clave` as const)}
                        className="su-inset w-36 shrink-0 rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                    />
                    <input
                        type="text"
                        placeholder="Valor"
                        disabled={disabled}
                        {...register(`camposAdicionales.${index}.valor` as const)}
                        className="su-inset flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:shadow-su-inset-focus disabled:opacity-60"
                    />
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => remove(index)}
                        className="su-icon-btn shrink-0 disabled:opacity-60"
                        aria-label="Eliminar campo"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            ))}
        </div>
    );
}