// src/features/reportes/api/reportes.api.ts
import { api } from "@/shared/lib/axios";
import {
    AlertasResponse,
    CuentasPorPagarResponse,
    InventarioValoradoResponse,
    IvaMensualParams,
    IvaMensualResponse,
    KpisResponse,
    ListIvaComprasResponse,
    ListIvaDetalleParams,
    ListIvaVentasResponse,
    StockBajoParams,
    StockBajoResponse,
    TopClientesResponse,
    TopProductosResponse,
    VentasSemanaResponse,
} from "../types/reportes.types";
/** Descarga un blob y dispara el diálogo de guardar del navegador */
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
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
    getStockBajo: async (params?: StockBajoParams): Promise<StockBajoResponse> => {
        const { data } = await api.get<StockBajoResponse>("/reportes/stock-bajo", {
            params: {
                umbral: params?.umbral,
                page: params?.page,
                limit: params?.limit,
            },
        });
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


    // ── IVA Mensual ─────────────────────────────────────────────────────────
    getIvaMensual: async (params: IvaMensualParams): Promise<IvaMensualResponse> => {
        const { data } = await api.post<IvaMensualResponse>("/reportes/iva-mensual", params);
        return data;
    },

    downloadIvaExcel: async (params: IvaMensualParams): Promise<void> => {
        const { data } = await api.post("/reportes/iva-mensual/excel", params, { responseType: "blob" });
        downloadBlob(data, `iva-${params.mes}-${params.anio}.xlsx`);
    },

    downloadIvaPdf: async (params: IvaMensualParams): Promise<void> => {
        const { data } = await api.post("/reportes/iva-mensual/pdf", params, { responseType: "blob" });
        downloadBlob(data, `iva-${params.mes}-${params.anio}.pdf`);
    },

    // ── Inventario Valorado ──────────────────────────────────────────────────
    getInventarioValorado: async (): Promise<InventarioValoradoResponse> => {
        const { data } = await api.get<InventarioValoradoResponse>("/reportes/inventario-valorado");
        return data;
    },

    downloadInventarioExcel: async (): Promise<void> => {
        const { data } = await api.get("/reportes/inventario-valorado/excel", { responseType: "blob" });
        downloadBlob(data, "inventario-valorado.xlsx");
    },

    downloadInventarioPdf: async (): Promise<void> => {
        const { data } = await api.get("/reportes/inventario-valorado/pdf", { responseType: "blob" });
        downloadBlob(data, "inventario-valorado.pdf");
    },

    // ── Cuentas por Pagar ────────────────────────────────────────────────────
    getCuentasPorPagar: async (): Promise<CuentasPorPagarResponse> => {
        const { data } = await api.get<CuentasPorPagarResponse>("/reportes/cuentas-por-pagar");
        return data;
    },

    downloadCuentasExcel: async (): Promise<void> => {
        const { data } = await api.get("/reportes/cuentas-por-pagar/excel", { responseType: "blob" });
        downloadBlob(data, "cuentas-por-pagar.xlsx");
    },

    downloadCuentasPdf: async (): Promise<void> => {
        const { data } = await api.get("/reportes/cuentas-por-pagar/pdf", { responseType: "blob" });
        downloadBlob(data, "cuentas-por-pagar.pdf");
    },

    listIvaVentas: async (params: ListIvaDetalleParams): Promise<ListIvaVentasResponse> => {
        const { data } = await api.post<ListIvaVentasResponse>("/reportes/iva-mensual/ventas", params);
        return data;
    },

    listIvaCompras: async (params: ListIvaDetalleParams): Promise<ListIvaComprasResponse> => {
        const { data } = await api.post<ListIvaComprasResponse>("/reportes/iva-mensual/compras", params);
        return data;
    },
};