// src/features/reportes/hooks/useStockBajo.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { reportesApi } from "../api/reportes.api";
import { StockBajoResponse } from "../types/reportes.types";

const EMPTY: StockBajoResponse = { total: 0, page: 0, limit: 10, totalPages: 0, items: [] };

interface UseStockBajoReturn {
    data: StockBajoResponse;
    isLoading: boolean;
    error: string | null;
    page: number;          // base 1, para la UI
    perPage: number;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    umbral: number;
    setUmbral: (umbral: number) => void;
}

export function useStockBajo(umbralInicial: number = 5): UseStockBajoReturn {
    const [data, setData] = useState<StockBajoResponse>(EMPTY);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1); // base 1 en la UI
    const [perPage, setPerPage] = useState(10);
    const [umbral, setUmbral] = useState(umbralInicial);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await reportesApi.getStockBajo({
                umbral,
                page: page - 1, // convierte a base 0 para el backend
                limit: perPage,
            });
            setData(result);
        } catch {
            setError("No se pudo cargar el stock bajo.");
            setData(EMPTY);
        } finally {
            setIsLoading(false);
        }
    }, [umbral, page, perPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetPerPage = useCallback((n: number) => {
        setPerPage(n);
        setPage(1); // reset a la primera página al cambiar filas por página
    }, []);

    const handleSetUmbral = useCallback((n: number) => {
        setUmbral(n);
        setPage(1);
    }, []);

    return {
        data,
        isLoading,
        error,
        page,
        perPage,
        setPage,
        setPerPage: handleSetPerPage,
        umbral,
        setUmbral: handleSetUmbral,
    };
}