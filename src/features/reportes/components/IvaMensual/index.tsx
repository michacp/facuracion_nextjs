"use client";
// src/features/reportes/components/IvaMensual/index.tsx

import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Loader2, Search } from "lucide-react";
import { Table, Row, Cell, DEFAULT_PAGE_SIZE_OPTIONS } from "@/components/common/Table";
import type { ColHeader } from "@/components/common/Table";
import { useIvaMensual } from "../../hooks/useIvaMensual";
import { useIvaDetalleVentas } from "../../hooks/useIvaDetalleVentas";
import { useIvaDetalleCompras } from "../../hooks/useIvaDetalleCompras";
import { reportesApi } from "../../api/reportes.api";
import { MESES, fmtCurrency, fmtDate, fmtMes } from "../../utils/reportes.utils";

// ── Columnas ──────────────────────────────────────────────────────────────────
const COL_VENTAS: ColHeader[] = [
    { label: "Comprobante" },
    { label: "Fecha" },
    { label: "Cliente" },
    { label: "Ítem" },
    { label: "Cant.",     align: "right" },
    { label: "P. Unit.",  align: "right" },
    { label: "Base imp.", align: "right" },
    { label: "Tarifa",    align: "right" },
    { label: "IVA",       align: "right" },
];
const COL_VENTAS_TPL = "120px 100px 1fr 1fr 60px 90px 100px 70px 90px";

const COL_COMPRAS: ColHeader[] = [
    { label: "Documento" },
    { label: "Fecha" },
    { label: "Proveedor" },
    { label: "Base imp.", align: "right" },
    { label: "Tarifa",    align: "right" },
    { label: "IVA",       align: "right" },
];
const COL_COMPRAS_TPL = "150px 100px 1fr 110px 70px 90px";

// ── Botones de descarga ───────────────────────────────────────────────────────
function DownloadButtons({ mes, anio }: { mes: number; anio: number }) {
    const [loadingXlsx, setLoadingXlsx] = useState(false);
    const [loadingPdf,  setLoadingPdf]  = useState(false);

    const handleExcel = async () => {
        setLoadingXlsx(true);
        try { await reportesApi.downloadIvaExcel({ mes, anio }); }
        finally { setLoadingXlsx(false); }
    };
    const handlePdf = async () => {
        setLoadingPdf(true);
        try { await reportesApi.downloadIvaPdf({ mes, anio }); }
        finally { setLoadingPdf(false); }
    };

    return (
        <div className="flex items-center gap-2">
            <button type="button" onClick={handleExcel} disabled={loadingXlsx}
                className="su-icon-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-60">
                {loadingXlsx ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                Excel
            </button>
            <button type="button" onClick={handlePdf} disabled={loadingPdf}
                className="su-icon-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium disabled:opacity-60">
                {loadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                PDF
            </button>
        </div>
    );
}

// ── Tarjeta de resumen ────────────────────────────────────────────────────────
function ResumenCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="su-surface-md rounded-2xl p-4 flex flex-col gap-1">
            <span className="su-field-label">{label}</span>
            <span className={`text-lg font-bold ${accent ? "text-brand-indigo" : "text-foreground"}`}>
                {value}
            </span>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function IvaMensual() {
    const {
        mes, anio, data, loading, loaded,
        handleMesChange, handleAnioChange, handleConsultar,
    } = useIvaMensual();

    const ventasHook  = useIvaDetalleVentas(mes, anio);
    const comprasHook = useIvaDetalleCompras(mes, anio);

    // Cuando el resumen carga con éxito, inicializa ambas tablas de detalle
    useEffect(() => {
        if (data) {
            ventasHook.init();
            comprasHook.init();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const anios = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

            {/* ── Filtros ───────────────────────────────────────────── */}
            <div className="flex items-end gap-3 flex-wrap">
                <div className="flex flex-col gap-1.5">
                    <label className="su-field-label pl-1">Mes</label>
                    <select value={mes} onChange={(e) => handleMesChange(Number(e.target.value))}
                        className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none"
                        style={{ color: "var(--foreground)", background: "var(--su-bg)" }}>
                        {MESES.map((m, i) => (
                            <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="su-field-label pl-1">Año</label>
                    <select value={anio} onChange={(e) => handleAnioChange(Number(e.target.value))}
                        className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none"
                        style={{ color: "var(--foreground)", background: "var(--su-bg)" }}>
                        {anios.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="su-field-label pl-1 invisible">x</span>
                    <button type="button" onClick={handleConsultar} disabled={loading}
                        className="su-brand flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold disabled:opacity-60">
                        <Search size={14} />
                        {loading ? "Consultando…" : "Consultar"}
                    </button>
                </div>

                {loaded && (
                    <div className="flex flex-col gap-1.5 ml-auto">
                        <span className="su-field-label pl-1 invisible">x</span>
                        <DownloadButtons mes={mes} anio={anio} />
                    </div>
                )}
            </div>

            {/* ── Estado inicial ────────────────────────────────────── */}
            {!loaded && !loading && (
                <div className="su-surface-md rounded-2xl p-10 text-center text-sm text-su-text-muted">
                    Selecciona mes y año, luego pulsa Consultar.
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center gap-3 py-16">
                    <div className="w-5 h-5 rounded-full border-2 animate-spin"
                        style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
                    <span className="text-sm text-su-text-muted">Generando reporte…</span>
                </div>
            )}

            {data && !loading && (
                <div className="flex flex-col gap-6">

                    <h2 className="text-base font-bold text-su-text">
                        Reporte IVA — {fmtMes(data.mes, data.anio)}
                    </h2>

                    {/* Resumen */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <ResumenCard label="IVA en ventas"  value={fmtCurrency(data.iva_total_ventas)} />
                        <ResumenCard label="IVA en compras" value={fmtCurrency(data.iva_total_compras)} />
                        <ResumenCard label="IVA a pagar"    value={fmtCurrency(data.iva_a_pagar)} accent />
                    </div>

                    {/* Resumen ventas por tarifa */}
                    <section className="su-surface-md rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-[var(--su-divider)] bg-su-bg-deep">
                            <span className="text-xs font-semibold text-su-text">Resumen ventas por tarifa</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--su-divider)]">
                                        {["Tarifa %", "Base imponible", "IVA", "Registros"].map((h) => (
                                            <th key={h} className="su-field-label px-5 py-2.5 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.resumen_ventas.map((r, i) => (
                                        <tr key={i} className="border-b border-[var(--su-divider)] last:border-0 hover:bg-su-bg-deep transition-colors">
                                            <td className="px-5 py-2.5 font-mono">{r.tarifa_porcentaje}%</td>
                                            <td className="px-5 py-2.5">{fmtCurrency(r.base_imponible)}</td>
                                            <td className="px-5 py-2.5">{fmtCurrency(r.iva)}</td>
                                            <td className="px-5 py-2.5 text-su-text-muted">{r.cantidad_registros}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Resumen compras por tarifa */}
                    <section className="su-surface-md rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-[var(--su-divider)] bg-su-bg-deep">
                            <span className="text-xs font-semibold text-su-text">Resumen compras por tarifa</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--su-divider)]">
                                        {["Tarifa %", "Base imponible", "IVA", "Registros"].map((h) => (
                                            <th key={h} className="su-field-label px-5 py-2.5 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.resumen_compras.map((r, i) => (
                                        <tr key={i} className="border-b border-[var(--su-divider)] last:border-0 hover:bg-su-bg-deep transition-colors">
                                            <td className="px-5 py-2.5 font-mono">{r.tarifa_porcentaje}%</td>
                                            <td className="px-5 py-2.5">{fmtCurrency(r.base_imponible)}</td>
                                            <td className="px-5 py-2.5">{fmtCurrency(r.iva)}</td>
                                            <td className="px-5 py-2.5 text-su-text-muted">{r.cantidad_registros}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Detalle ventas paginado ───────────────────── */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-sm font-semibold text-su-text flex-1">
                                Detalle ventas
                                <span className="ml-2 text-su-text-muted font-normal">({ventasHook.total})</span>
                            </h3>
                            <div className="su-inset rounded-2xl flex items-center gap-2 px-3"
                                style={{ border: "1px solid var(--su-border)" }}>
                                <Search size={13} style={{ color: "var(--su-text-muted)" }} />
                                <input type="text" value={ventasHook.search}
                                    onChange={(e) => ventasHook.handleSearchChange(e.target.value)}
                                    placeholder="Buscar cliente o ítem…"
                                    className="w-44 bg-transparent py-2 text-xs outline-none placeholder:text-[var(--su-text-subtle)]"
                                    style={{ color: "var(--foreground)" }} />
                            </div>
                        </div>

                        <Table
                            colTemplate={COL_VENTAS_TPL}
                            headers={COL_VENTAS}
                            loading={ventasHook.loading}
                            loadingMessage="Cargando ventas…"
                            emptyMessage="No se encontraron registros de ventas"
                            currentPage={ventasHook.page}
                            totalItems={ventasHook.total}
                            itemsPerPage={ventasHook.limit}
                            onPageChange={ventasHook.handlePageChange}
                            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                        >
                            {ventasHook.items.map((v) => (
                                <Row key={v.venta_id} colTemplate={COL_VENTAS_TPL} py="py-2">
                                    <Cell main={v.numero_venta} font="mono" />
                                    <Cell main={fmtDate(v.fecha_emision)} />
                                    <Cell main={v.cliente} sub={v.identificacion} />
                                    <Cell main={v.item_nombre} />
                                    <Cell main={v.cantidad} align="right" />
                                    <Cell main={fmtCurrency(v.precio_unitario)} align="right" />
                                    <Cell main={fmtCurrency(v.base_imponible)} align="right" />
                                    <Cell main={`${v.tarifa_porcentaje}%`} align="right" font="mono" />
                                    <Cell main={fmtCurrency(v.iva_calculado)} align="right" />
                                </Row>
                            ))}
                        </Table>
                    </div>

                    {/* ── Detalle compras paginado ──────────────────── */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-sm font-semibold text-su-text flex-1">
                                Detalle compras
                                <span className="ml-2 text-su-text-muted font-normal">({comprasHook.total})</span>
                            </h3>
                            <div className="su-inset rounded-2xl flex items-center gap-2 px-3"
                                style={{ border: "1px solid var(--su-border)" }}>
                                <Search size={13} style={{ color: "var(--su-text-muted)" }} />
                                <input type="text" value={comprasHook.search}
                                    onChange={(e) => comprasHook.handleSearchChange(e.target.value)}
                                    placeholder="Buscar proveedor…"
                                    className="w-44 bg-transparent py-2 text-xs outline-none placeholder:text-[var(--su-text-subtle)]"
                                    style={{ color: "var(--foreground)" }} />
                            </div>
                        </div>

                        <Table
                            colTemplate={COL_COMPRAS_TPL}
                            headers={COL_COMPRAS}
                            loading={comprasHook.loading}
                            loadingMessage="Cargando compras…"
                            emptyMessage="No se encontraron registros de compras"
                            currentPage={comprasHook.page}
                            totalItems={comprasHook.total}
                            itemsPerPage={comprasHook.limit}
                            onPageChange={comprasHook.handlePageChange}
                            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                        >
                            {comprasHook.items.map((c) => (
                                <Row key={c.compra_id} colTemplate={COL_COMPRAS_TPL} py="py-2">
                                    <Cell main={c.numero_documento} font="mono" />
                                    <Cell main={fmtDate(c.fecha_emision)} />
                                    <Cell main={c.proveedor} sub={c.proveedor_identificacion} />
                                    <Cell main={fmtCurrency(c.base_imponible)} align="right" />
                                    <Cell main={`${c.tarifa_porcentaje}%`} align="right" font="mono" />
                                    <Cell main={fmtCurrency(c.iva)} align="right" />
                                </Row>
                            ))}
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}