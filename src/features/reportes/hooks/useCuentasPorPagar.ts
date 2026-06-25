"use client";
// src/features/reportes/hooks/useCuentasPorPagar.ts

import { useEffect, useState } from "react";
import { reportesApi } from "../api/reportes.api";
import { CuentasPorPagarResponse } from "../types/reportes.types";

export function useCuentasPorPagar() {
    const [data, setData] = useState<CuentasPorPagarResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Búsqueda local sobre proveedores ya cargados
    const [search, setSearch] = useState("");

    // Proveedor expandido para ver el detalle de sus compras
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await reportesApi.getCuentasPorPagar();
                setData(res);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const proveedoresFiltrados = data?.proveedores.filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            p.razon_social.toLowerCase().includes(q) ||
            p.identificacion.toLowerCase().includes(q)
        );
    }) ?? [];

    const toggleExpand = (id: number) =>
        setExpandedId((prev) => (prev === id ? null : id));

    return {
        data, loading,
        search, setSearch,
        proveedoresFiltrados,
        expandedId, toggleExpand,
    };
}