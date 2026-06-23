// src/features/ventas/hooks/useSalesList.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saleApi } from "../api/sale.api";
import type { Sale, TipoComprobante } from "../types/salesList.types";

function toISODate(d: Date | null): string | null {
    if (!d) return null;
    return d.toISOString().split("T")[0];
}

export function useSalesList() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [tipoComprobanteId, setTipoComprobanteId] = useState<number | null>(null);
    const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
    const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(30);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

    const prevSearchRef = useRef("");

    const fetchSales = useCallback(async (overrides: {
        searchQuery?: string;
        tipoComprobanteId?: number | null;
        fechaDesde?: Date | null;
        fechaHasta?: Date | null;
        pageIndex?: number;
        pageSize?: number;
    } = {}) => {
        setLoading(true);
        try {
            const res = await saleApi.listSales({
                filters: {
                    searchQuery: overrides.searchQuery ?? searchQuery,
                    tipo_comprobante_id: overrides.tipoComprobanteId !== undefined
                        ? overrides.tipoComprobanteId
                        : tipoComprobanteId,
                    fechaDesde: toISODate(overrides.fechaDesde !== undefined ? overrides.fechaDesde : fechaDesde),
                    fechaHasta: toISODate(overrides.fechaHasta !== undefined ? overrides.fechaHasta : fechaHasta),
                    pageIndex: overrides.pageIndex ?? pageIndex,
                    pageSize: overrides.pageSize ?? pageSize,
                },
            });
            setSales(res.sales ?? []);
            setTotalItems(res.total ?? 0);
            // Solo la primera carga llena el select
            if (res.tiposComprobante?.length) {
                setTiposComprobante(res.tiposComprobante);
            }
        } catch (err) {
            console.error("Error listando ventas:", err);
            toast.error("Error al cargar ventas");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, tipoComprobanteId, fechaDesde, fechaHasta, pageIndex, pageSize]);

    useEffect(() => { fetchSales(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function onKeyup() {
        const current = searchQuery.trim();
        if (!current && prevSearchRef.current) {
            prevSearchRef.current = "";
            fetchSales({ searchQuery: "", pageIndex: 0 });
        }
        if (current) prevSearchRef.current = current;
    }

    function onSearchEnter() {
        setPageIndex(0);
        fetchSales({ pageIndex: 0 });
    }

    function onTipoChange(id: number | null) {
        setTipoComprobanteId(id);
        setPageIndex(0);
        fetchSales({ tipoComprobanteId: id, pageIndex: 0 });
    }

    function onRangeChange(start: Date | null, end: Date | null) {
        setFechaDesde(start);
        setFechaHasta(end);
        // Solo dispara fetch cuando el rango está completo o se limpió
        if ((start && end) || (!start && !end)) {
            setPageIndex(0);
            fetchSales({ fechaDesde: start, fechaHasta: end, pageIndex: 0 });
        }
    }

    function onPageChange(page: number, size: number) {
        setPageIndex(page);
        setPageSize(size);
        fetchSales({ pageIndex: page, pageSize: size });
    }

    function toggleItems(index: number) {
        setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
    }

    return {
        sales, totalItems, loading,
        tiposComprobante,
        searchQuery, setSearchQuery,
        tipoComprobanteId,
        fechaDesde, fechaHasta,
        pageIndex, pageSize,
        expandedRows,
        onKeyup, onSearchEnter,
        onTipoChange,
        onRangeChange,
        onPageChange,
        toggleItems,
        reload: () => fetchSales(),
    };
}