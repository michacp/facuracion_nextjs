// src/features/productos/hooks/useIncomesList.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { comprasApi } from "../api/compras.api";
import type { CompraItem, EstadoPago, ListComprasParams } from "../types/incomesList.types";

export function useIncomesList() {
    const [compras, setCompras] = useState<CompraItem[]>([]);
    const [estadosPago, setEstadosPago] = useState<EstadoPago[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [searchText, setSearchText] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("");
    const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
    const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    const prevSearchRef = useRef("");

    // ── Consulta principal ────────────────────────────────────────────────
    const fetchCompras = useCallback(async (overrides: Partial<ListComprasParams> = {}) => {
        setLoading(true);
        try {
            function toISO(d: Date | null) {
                return d ? d.toISOString().split("T")[0] : undefined;
            }

            const params: ListComprasParams = {
                // Usamos 'in' para permitir explícitamente pasar 'undefined' y limpiar el filtro
                search: "search" in overrides ? overrides.search : (searchText || undefined),
                estadoPago: "estadoPago" in overrides ? overrides.estadoPago : (selectedEstado || undefined),
                fechaDesde: "fechaDesde" in overrides ? overrides.fechaDesde : toISO(fechaDesde),
                fechaHasta: "fechaHasta" in overrides ? overrides.fechaHasta : toISO(fechaHasta),
                page: overrides.page ?? currentPage,
                limit: overrides.limit ?? itemsPerPage,
            };

            const res = await comprasApi.listCompras(params);
            setCompras(res.compras);
            setTotalItems(res.total);
            setEstadosPago(res.estadosPago);
        } catch (err) {
            console.error("Error listando compras:", err);
            toast.error("Error al cargar ingresos");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, selectedEstado, fechaDesde, fechaHasta, currentPage, itemsPerPage]);

    // ngOnInit
    useEffect(() => { fetchCompras(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── onKeyup — aplica si se borró el campo ─────────────────────────────
    function onKeyup() {
        const current = searchText.trim();
        if (!current && prevSearchRef.current) {
            prevSearchRef.current = "";
            fetchCompras({ search: undefined, page: 0 });
        }
        if (current) prevSearchRef.current = current;
    }

    function onSearchEnter() {
        setCurrentPage(0);
        fetchCompras({ page: 0 });
    }

    // ── Cambio de estado ──────────────────────────────────────────────────
    function onEstadoChange(val: string) {
        setSelectedEstado(val);
        setCurrentPage(0);
        fetchCompras({ estadoPago: val || undefined, page: 0 });
    }

    // ── Cambio de fechas ──────────────────────────────────────────────────
    function onRangeChange(start: Date | null, end: Date | null) {
        setFechaDesde(start);
        setFechaHasta(end);

        // 1. Si se limpió (ambos null)
        if (!start && !end) {
            setCurrentPage(0);
            fetchCompras({ fechaDesde: undefined, fechaHasta: undefined, page: 0 });
        }
        // 2. O si el rango se completó (ambos tienen valor)
        else if (start && end) {
            setCurrentPage(0);
            fetchCompras({
                fechaDesde: start.toISOString().split("T")[0],
                fechaHasta: end.toISOString().split("T")[0],
                page: 0
            });
        }
    }

    // ── Paginación ────────────────────────────────────────────────────────
    function onPageChange(page: number, limit: number) {
        setCurrentPage(page);
        setItemsPerPage(limit);
        fetchCompras({ page, limit });
    }

    return {
        compras, estadosPago, totalItems, loading,
        searchText, setSearchText,
        selectedEstado,
        fechaDesde, fechaHasta,
        currentPage, itemsPerPage,
        onKeyup, onSearchEnter,
        onEstadoChange,
        onRangeChange,
        onPageChange,
        reload: () => fetchCompras(),
    };
}