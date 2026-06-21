"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clientesApi } from "../api/clientes.api";
import { ClienteListItem } from "../types/clientes.types";

const DEFAULT_LIMIT = 30;
const DEBOUNCE_MS = 350;

export function useClientesList() {
    const [clientes, setClientes] = useState<ClienteListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchClientes = useCallback(
        async (params: { search: string; page: number; limit: number }) => {
            setLoading(true);
            try {
                const res = await clientesApi.list({
                    search: params.search || undefined,
                    page: params.page,
                    limit: params.limit,
                });
                setClientes(res.clientes);
                setTotal(res.total);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Fetch inicial
    useEffect(() => {
        fetchClientes({ search, page, limit });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchClientes({ search: value, page: 0, limit });
        }, DEBOUNCE_MS);
    };

    const handlePageChange = (newPage: number, newLimit: number) => {
        const nextPage = newLimit !== limit ? 0 : newPage;
        setPage(nextPage);
        setLimit(newLimit);
        fetchClientes({ search, page: nextPage, limit: newLimit });
    };

    const refetch = () => fetchClientes({ search, page, limit });

    return {
        clientes,
        total,
        loading,
        search,
        page,
        limit,
        handleSearchChange,
        handlePageChange,
        refetch,
    };
}