"use client";
// src/features/reportes/hooks/useInventarioValorado.ts

import { useEffect, useState } from "react";
import { reportesApi } from "../api/reportes.api";
import { InventarioValoradoResponse } from "../types/reportes.types";

export function useInventarioValorado() {
    const [data, setData] = useState<InventarioValoradoResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Búsqueda local sobre los items ya cargados
    const [search, setSearch] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await reportesApi.getInventarioValorado();
                setData(res);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const itemsFiltrados = data?.items.filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            item.nombre.toLowerCase().includes(q) ||
            item.codigo.toLowerCase().includes(q)
        );
    }) ?? [];

    return { data, loading, search, setSearch, itemsFiltrados };
}