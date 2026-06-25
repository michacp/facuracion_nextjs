"use client";
// src/features/reportes/components/InventarioValorado/index.tsx

import { useState } from "react";
import { ChevronDown, ChevronRight, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useInventarioValorado } from "../../hooks/useInventarioValorado";
import { reportesApi } from "../../api/reportes.api";
import { fmtCurrency, fmtDate } from "../../utils/reportes.utils";
import { InventarioItem } from "../../types/reportes.types";

// ── Botón de descarga ─────────────────────────────────────────────────────────
function InventarioDownloadButton({ type }: { type: "excel" | "pdf" }) {
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        setLoading(true);
        try {
            type === "excel"
                ? await reportesApi.downloadInventarioExcel()
                : await reportesApi.downloadInventarioPdf();
        } finally { setLoading(false); }
    };
    return (
        <button type="button" onClick={handle} disabled={loading}
            className="su-icon-btn flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium disabled:opacity-60">
            {loading
                ? <Loader2 size={14} className="animate-spin" />
                : type === "excel" ? <FileSpreadsheet size={14} /> : <FileText size={14} />}
            {type === "excel" ? "Excel" : "PDF"}
        </button>
    );
}

// ── Fila expandible por item ──────────────────────────────────────────────────
function ItemRow({ item }: { item: InventarioItem }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr
                className="border-b border-[var(--su-divider)] hover:bg-su-bg-deep transition-colors cursor-pointer"
                onClick={() => setOpen((v) => !v)}
            >
                <td className="px-4 py-2.5">
                    {open
                        ? <ChevronDown size={13} className="text-su-text-muted" />
                        : <ChevronRight size={13} className="text-su-text-muted" />}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{item.codigo}</td>
                <td className="px-4 py-2.5 font-medium">{item.nombre}</td>
                <td className="px-4 py-2.5 text-right">{item.stock_total}</td>
                <td className="px-4 py-2.5 text-right">{fmtCurrency(item.costo_promedio)}</td>
                <td className="px-4 py-2.5 text-right font-semibold">{fmtCurrency(item.valor_total)}</td>
                <td className="px-4 py-2.5 text-right text-su-text-muted">{item.lotes.length}</td>
            </tr>

            {/* Detalle de lotes */}
            {open && item.lotes.map((lote) => (
                <tr key={lote.lote_id}
                    className="border-b border-[var(--su-divider)] bg-su-bg-deep last:border-0">
                    <td />
                    <td className="px-4 py-2 font-mono text-[11px] text-su-text-muted pl-8" colSpan={1}>
                        {lote.numero_lote}
                    </td>
                    <td className="px-4 py-2 text-xs text-su-text-muted">Lote</td>
                    <td className="px-4 py-2 text-right text-xs">{lote.cantidad}</td>
                    <td className="px-4 py-2 text-right text-xs">{fmtCurrency(lote.costo_origen)}</td>
                    <td className="px-4 py-2 text-right text-xs">{fmtCurrency(lote.valor_lote)}</td>
                    <td />
                </tr>
            ))}
        </>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function InventarioValorado() {
    const { data, loading, search, setSearch, itemsFiltrados } = useInventarioValorado();

    return (
        <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

            {/* ── Cabecera ──────────────────────────────────────────── */}
            <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
                    <label className="su-field-label pl-1">Buscar producto</label>
                    <div className="su-inset rounded-2xl flex items-center gap-2 px-3"
                        style={{ border: "1px solid var(--su-border)" }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}
                            style={{ color: "var(--su-text-muted)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Nombre o código…"
                            className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
                            style={{ color: "var(--foreground)" }}
                        />
                    </div>
                </div>

                {data && (
                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label pl-1 invisible">x</span>
                        <div className="flex gap-2">
                            <InventarioDownloadButton type="excel" />
                            <InventarioDownloadButton type="pdf" />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Loading ───────────────────────────────────────────── */}
            {loading && (
                <div className="flex items-center justify-center gap-3 py-16">
                    <div className="w-5 h-5 rounded-full border-2 animate-spin"
                        style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
                    <span className="text-sm text-su-text-muted">Cargando inventario…</span>
                </div>
            )}

            {data && !loading && (
                <div className="flex flex-col gap-6">

                    {/* Resumen */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-base font-bold text-su-text">
                            Inventario Valorado — corte {fmtDate(data.fecha_corte)}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1">
                            <span className="su-field-label">Total ítems</span>
                            <span className="text-lg font-bold text-foreground">{data.total_items}</span>
                        </div>
                        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1">
                            <span className="su-field-label">Ítems visibles</span>
                            <span className="text-lg font-bold text-foreground">{itemsFiltrados.length}</span>
                        </div>
                        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1 sm:col-span-1 col-span-2">
                            <span className="su-field-label">Valor total inventario</span>
                            <span className="text-lg font-bold text-brand-indigo">
                                {fmtCurrency(data.valor_total_inventario)}
                            </span>
                        </div>
                    </div>

                    {/* Tabla */}
                    <section className="su-surface-md rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--su-divider)] bg-su-bg-deep">
                                        <th className="w-8" />
                                        {["Código", "Nombre", "Stock", "Costo prom.", "Valor total", "Lotes"].map((h) => (
                                            <th key={h} className="su-field-label px-4 py-2.5 text-left whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-sm text-su-text-muted">
                                                No se encontraron productos.
                                            </td>
                                        </tr>
                                    ) : (
                                        itemsFiltrados.map((item) => (
                                            <ItemRow key={item.item_id} item={item} />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}