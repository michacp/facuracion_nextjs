"use client";
// src/features/proveedores/hooks/useProveedoresList.ts

import { useCallback, useEffect, useRef, useState } from "react";
import { proveedorListApi } from "../api/proveedor-list.api";
import { ProveedorListItem } from "../types/proveedor-list.types";

const DEFAULT_LIMIT = 30;
const DEBOUNCE_MS = 350;

export function useProveedoresList() {
    const [proveedores, setProveedores] = useState<ProveedorListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchProveedores = useCallback(
        async (params: { search: string; page: number; limit: number }) => {
            setLoading(true);
            try {
                const res = await proveedorListApi.list({
                    search: params.search || undefined,
                    page: params.page,
                    limit: params.limit,
                });
                setProveedores(res.proveedores);
                setTotal(res.total);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchProveedores({ search, page, limit });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchProveedores({ search: value, page: 0, limit });
        }, DEBOUNCE_MS);
    };

    const handlePageChange = (newPage: number, newLimit: number) => {
        const nextPage = newLimit !== limit ? 0 : newPage;
        setPage(nextPage);
        setLimit(newLimit);
        fetchProveedores({ search, page: nextPage, limit: newLimit });
    };

    const refetch = () => fetchProveedores({ search, page, limit });

    return {
        proveedores, total, loading,
        search, page, limit,
        handleSearchChange, handlePageChange, refetch,
    };
}