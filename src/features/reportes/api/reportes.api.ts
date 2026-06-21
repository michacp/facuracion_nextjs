// src/features/reportes/api/reportes.api.ts
import { api } from "@/shared/lib/axios";
import {
    AlertasResponse,
    KpisResponse,
    StockBajoResponse,
    TopClientesResponse,
    TopProductosResponse,
    VentasSemanaResponse,
} from "../types/reportes.types";

export type PeriodoTop = "semana" | "mes" | "anio";

export const reportesApi = {
    /** KPIs principales: ventas, compras y utilidad por semana / mes / año */
    getKpis: async (): Promise<KpisResponse> => {
        const { data } = await api.get<KpisResponse>("/reportes/kpis");
        return data;
    },

    /** Ventas agrupadas por semanas (para el gráfico de barras) */
    getVentasSemanas: async (): Promise<VentasSemanaResponse> => {
        const { data } = await api.get<VentasSemanaResponse>("/reportes/ventas-semanas");
        return data;
    },

    /** Productos con stock por debajo del umbral configurado */
    getStockBajo: async (): Promise<StockBajoResponse> => {
        const { data } = await api.get<StockBajoResponse>("/reportes/stock-bajo");
        return data;
    },

    /** Alertas del sistema: firmas, facturas pendientes y compras por pagar */
    getAlertas: async (): Promise<AlertasResponse> => {
        const { data } = await api.get<AlertasResponse>("/reportes/alertas");
        return data;
    },

    /** Top productos más vendidos en el período indicado */
    getTopProductos: async (periodo: PeriodoTop = "mes"): Promise<TopProductosResponse> => {
        const { data } = await api.get<TopProductosResponse>("/reportes/top-productos", {
            params: { periodo },
        });
        return data;
    },

    /** Top clientes con mayor facturación en el período indicado */
    getTopClientes: async (periodo: PeriodoTop = "mes"): Promise<TopClientesResponse> => {
        const { data } = await api.get<TopClientesResponse>("/reportes/top-clientes", {
            params: { periodo },
        });
        return data;
    },
};