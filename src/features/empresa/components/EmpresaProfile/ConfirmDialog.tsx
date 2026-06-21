"use client";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = "Eliminar",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="su-dropdown w-full max-w-sm p-6">
                <h3 className="text-sm font-semibold text-su-text mb-2">{title}</h3>
                <p className="text-sm text-su-text-muted mb-5">{description}</p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="su-icon-btn px-4 py-2 text-xs font-medium disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-su-sm disabled:opacity-60"
                    >
                        {loading ? "Eliminando…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}