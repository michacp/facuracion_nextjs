"use client";
// src/features/reportes/components/CuentasPorPagar/index.tsx

import { useState } from "react";
import { ChevronDown, ChevronRight, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useCuentasPorPagar } from "../../hooks/useCuentasPorPagar";
import { reportesApi } from "../../api/reportes.api";
import {
    antiguedadClass,
    estadoPagoBadge,
    fmtCurrency,
    fmtDate,
} from "../../utils/reportes.utils";
import { ProveedorCuentas } from "../../types/reportes.types";

// ── Botón de descarga ─────────────────────────────────────────────────────────
function CuentasDownloadButton({ type }: { type: "excel" | "pdf" }) {
    const [loading, setLoading] = useState(false);
    const handle = async () => {
        setLoading(true);
        try {
            type === "excel"
                ? await reportesApi.downloadCuentasExcel()
                : await reportesApi.downloadCuentasPdf();
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

// ── Fila expandible por proveedor ─────────────────────────────────────────────
function ProveedorRow({
    proveedor,
    expanded,
    onToggle,
}: {
    proveedor: ProveedorCuentas;
    expanded: boolean;
    onToggle: () => void;
}) {
    return (
        <>
            {/* Fila proveedor */}
            <tr
                className="border-b border-[var(--su-divider)] hover:bg-su-bg-deep transition-colors cursor-pointer"
                onClick={onToggle}
            >
                <td className="px-4 py-3">
                    {expanded
                        ? <ChevronDown size={13} className="text-su-text-muted" />
                        : <ChevronRight size={13} className="text-su-text-muted" />}
                </td>
                <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{proveedor.razon_social}</p>
                    <p className="text-[11px] text-su-text-muted font-mono">{proveedor.identificacion}</p>
                </td>
                <td className="px-4 py-3 text-right text-su-text-muted">{proveedor.compras.length}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">
                    {fmtCurrency(proveedor.saldo_total)}
                </td>
            </tr>

            {/* Filas de compras del proveedor */}
            {expanded && proveedor.compras.map((c) => (
                <tr key={c.compra_id}
                    className="border-b border-[var(--su-divider)] bg-su-bg-deep last:border-0">
                    <td />
                    <td className="px-4 py-2.5 pl-8">
                        <p className="font-mono text-xs">{c.numero_documento}</p>
                        <p className="text-[11px] text-su-text-muted">{fmtDate(c.fecha_emision)}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${estadoPagoBadge(c.estado_pago)}`}>
                            {c.estado_pago}
                        </span>
                    </td>
                    <td className="px-4 py-2.5">
                        <div className="flex flex-col items-end gap-0.5">
                            <div className="grid grid-cols-3 gap-x-4 text-xs text-right w-full max-w-[280px]">
                                <span className="text-su-text-muted">Total</span>
                                <span className="text-su-text-muted">Pagado</span>
                                <span className="text-su-text-muted">Saldo</span>
                                <span>{fmtCurrency(c.total_pagar)}</span>
                                <span>{fmtCurrency(c.total_pagado)}</span>
                                <span className="font-semibold text-red-600">{fmtCurrency(c.saldo_pendiente)}</span>
                            </div>
                            <span className={`text-[11px] font-medium ${antiguedadClass(c.dias_antiguedad)}`}>
                                {c.dias_antiguedad} días de antigüedad
                            </span>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function CuentasPorPagar() {
    const {
        data, loading,
        search, setSearch,
        proveedoresFiltrados,
        expandedId, toggleExpand,
    } = useCuentasPorPagar();

    return (
        <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

            {/* ── Cabecera ──────────────────────────────────────────── */}
            <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
                    <label className="su-field-label pl-1">Buscar proveedor</label>
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
                            placeholder="Nombre o RUC…"
                            className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
                            style={{ color: "var(--foreground)" }}
                        />
                    </div>
                </div>

                {data && (
                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label pl-1 invisible">x</span>
                        <div className="flex gap-2">
                            <CuentasDownloadButton type="excel" />
                            <CuentasDownloadButton type="pdf" />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Loading ───────────────────────────────────────────── */}
            {loading && (
                <div className="flex items-center justify-center gap-3 py-16">
                    <div className="w-5 h-5 rounded-full border-2 animate-spin"
                        style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
                    <span className="text-sm text-su-text-muted">Cargando cuentas por pagar…</span>
                </div>
            )}

            {data && !loading && (
                <div className="flex flex-col gap-6">

                    <h2 className="text-base font-bold text-su-text">
                        Cuentas por Pagar — corte {fmtDate(data.fecha_corte)}
                    </h2>

                    {/* Resumen */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1">
                            <span className="su-field-label">Proveedores</span>
                            <span className="text-lg font-bold text-foreground">{data.total_proveedores}</span>
                        </div>
                        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1">
                            <span className="su-field-label">Visibles</span>
                            <span className="text-lg font-bold text-foreground">{proveedoresFiltrados.length}</span>
                        </div>
                        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1 col-span-2 sm:col-span-1">
                            <span className="su-field-label">Total por pagar</span>
                            <span className="text-lg font-bold text-red-600">
                                {fmtCurrency(data.total_por_pagar)}
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
                                        <th className="su-field-label px-4 py-2.5 text-left">Proveedor</th>
                                        <th className="su-field-label px-4 py-2.5 text-right">Compras</th>
                                        <th className="su-field-label px-4 py-2.5 text-right">Saldo total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proveedoresFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-10 text-center text-sm text-su-text-muted">
                                                No se encontraron proveedores.
                                            </td>
                                        </tr>
                                    ) : (
                                        proveedoresFiltrados.map((p) => (
                                            <ProveedorRow
                                                key={p.proveedor_id}
                                                proveedor={p}
                                                expanded={expandedId === p.proveedor_id}
                                                onToggle={() => toggleExpand(p.proveedor_id)}
                                            />
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