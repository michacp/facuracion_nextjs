"use client";
// src/features/reportes/hooks/useIvaDetalleVentas.ts

import { useCallback, useRef, useState } from "react";
import { reportesApi } from "../api/reportes.api";
import { IvaDetalleVenta } from "../types/reportes.types";

const DEFAULT_LIMIT = 30;
const DEBOUNCE_MS = 350;

export function useIvaDetalleVentas(mes: number, anio: number) {
    const [items, setItems] = useState<IvaDetalleVenta[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetch = useCallback(
        async (params: { search: string; page: number; limit: number }) => {
            setLoading(true);
            try {
                const res = await reportesApi.listIvaVentas({
                    mes,
                    anio,
                    search: params.search || undefined,
                    page: params.page,
                    limit: params.limit,
                });
                setItems(res.detalle);
                setTotal(res.total);
            } finally {
                setLoading(false);
            }
        },
        [mes, anio]
    );

    /** Llama al backend por primera vez (cuando el reporte principal ya cargó) */
    const init = useCallback(() => {
        setSearch("");
        setPage(0);
        setLimit(DEFAULT_LIMIT);
        fetch({ search: "", page: 0, limit: DEFAULT_LIMIT });
    }, [fetch]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetch({ search: value, page: 0, limit });
        }, DEBOUNCE_MS);
    };

    const handlePageChange = (newPage: number, newLimit: number) => {
        const nextPage = newLimit !== limit ? 0 : newPage;
        setPage(nextPage);
        setLimit(newLimit);
        fetch({ search, page: nextPage, limit: newLimit });
    };

    return {
        items, total, loading,
        search, page, limit,
        init, handleSearchChange, handlePageChange,
    };
}