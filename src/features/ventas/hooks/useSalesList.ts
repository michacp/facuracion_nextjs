// src/features/ventas/hooks/useSalesList.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saleApi } from "../api/sale.api";
import type { Sale } from "../types/salesList.types";

export function useSalesList() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filtros — misma forma que el Angular
    const [searchQuery, setSearchQuery] = useState("");
    const [formaPago, setFormaPago] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(30);

    // expand/collapse de ítems por fila
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

    const prevSearchRef = useRef("");

    // ── Carga ─────────────────────────────────────────────────────────────
    const fetchSales = useCallback(async (overrides: {
        searchQuery?: string;
        formaPago?: string;
        pageIndex?: number;
        pageSize?: number;
    } = {}) => {
        setLoading(true);
        try {
            const res = await saleApi.listSales({
                filters: {
                    searchQuery: overrides.searchQuery ?? searchQuery,
                    forma_pago: overrides.formaPago ?? formaPago,
                    pageIndex: overrides.pageIndex ?? pageIndex,
                    pageSize: overrides.pageSize ?? pageSize,
                },
            });
            setSales(res.sales ?? []);
            setTotalItems(res.total ?? 0);
        } catch (err) {
            console.error("Error listando ventas:", err);
            toast.error("Error al cargar ventas");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, formaPago, pageIndex, pageSize]);

    useEffect(() => { fetchSales(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Buscador ──────────────────────────────────────────────────────────
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

    // ── Forma de pago ─────────────────────────────────────────────────────
    function onFormaPagoChange(val: string) {
        setFormaPago(val);
        setPageIndex(0);
        fetchSales({ formaPago: val, pageIndex: 0 });
    }

    // ── Paginación ────────────────────────────────────────────────────────
    function onPageChange(page: number, size: number) {
        setPageIndex(page);
        setPageSize(size);
        fetchSales({ pageIndex: page, pageSize: size });
    }

    // ── Expand/collapse ítems ─────────────────────────────────────────────
    function toggleItems(index: number) {
        setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
    }

    function getVisibleItems(sale: Sale, index: number) {
        return expandedRows[index] ? sale.items : sale.items.slice(0, 2);
    }

    return {
        sales, totalItems, loading,
        searchQuery, setSearchQuery,
        formaPago,
        pageIndex, pageSize,
        expandedRows,
        onKeyup, onSearchEnter,
        onFormaPagoChange,
        onPageChange,
        toggleItems, getVisibleItems,
        reload: () => fetchSales(),
    };
}