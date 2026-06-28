// src/features/reportes/hooks/useDashboard.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { reportesApi, PeriodoTop } from "../api/reportes.api";
import { DashboardData } from "../types/reportes.types";

interface UseDashboardState {
    data: DashboardData | null;
    isLoading: boolean;
    error: string | null;
}

interface UseDashboardReturn extends UseDashboardState {
    refetch: () => Promise<void>;
    setPeriodoTop: (periodo: PeriodoTop) => void;
    periodoTop: PeriodoTop;
}

/**
 * Hook central del Dashboard.
 * Dispara todas las peticiones en paralelo con Promise.allSettled para que
 * un endpoint caído no rompa el resto del panel.
 */
export function useDashboard(): UseDashboardReturn {
    const [state, setState] = useState<UseDashboardState>({
        data: null,
        isLoading: true,
        error: null,
    });

    const [periodoTop, setPeriodoTop] = useState<PeriodoTop>("mes");

const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const [kpisResult, semanasResult, alertasResult, productosResult, clientesResult] =
        await Promise.allSettled([
            reportesApi.getKpis(),
            reportesApi.getVentasSemanas(),
            reportesApi.getAlertas(),
            reportesApi.getTopProductos(periodoTop),
            reportesApi.getTopClientes(periodoTop),
        ]);

    if (kpisResult.status === "rejected") {
        setState({
            data: null,
            isLoading: false,
            error: "No se pudo cargar el panel. Intenta nuevamente.",
        });
        return;
    }

    setState({
        isLoading: false,
        error: null,
        data: {
            kpis: kpisResult.value,
            ventasSemanas:
                semanasResult.status === "fulfilled"
                    ? semanasResult.value
                    : { semanas: [] },
            alertas:
                alertasResult.status === "fulfilled"
                    ? alertasResult.value
                    : {
                        firmas_por_vencer: [],
                        facturas_pendientes: [],
                        compras_por_pagar: [],
                        total_alertas: 0,
                    },
            topProductos:
                productosResult.status === "fulfilled"
                    ? productosResult.value
                    : { productos: [], periodo: periodoTop },
            topClientes:
                clientesResult.status === "fulfilled"
                    ? clientesResult.value
                    : { clientes: [], periodo: periodoTop },
        },
    });
}, [periodoTop]);
    // Carga inicial
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        ...state,
        refetch: fetchAll,
        periodoTop,
        setPeriodoTop,
    };
}