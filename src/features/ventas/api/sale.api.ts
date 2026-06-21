// src/features/ventas/api/sale.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import type { ListSalesParams, ListSalesResponse } from "../types/salesList.types";
import type { NewDataVentas, SaleList5last } from "../types/saleForm.types";
// ── Types específicos de ventas ────────────────────────────────────────────────


export interface SaveSalePayload {
    [key: string]: any;
}

export interface SaveSaleResponse {
    [key: string]: any;
}

// ── Helpers PDF (equivalen a printTicketPDF / printA4PDF del Angular) ─────────

async function openBase64PDF(base64: string): Promise<void> {
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const tab = window.open(blobUrl, "_blank");
    if (!tab) console.warn("El navegador bloqueó la apertura del PDF");
    else tab.addEventListener("unload", () => URL.revokeObjectURL(blobUrl));
}

// ── API ────────────────────────────────────────────────────────────────────────

export const saleApi = {
    /** Datos iniciales del formulario de venta */
    getNewData: async (): Promise<NewDataVentas> => {
        const { data } = await api.get<NewDataVentas>("/ventas/getnewdata");
        return data;
    },

    /** Guarda una venta */
    save: async (payload: SaveSalePayload): Promise<SaveSaleResponse> => {
        const { data } = await api.post<SaveSaleResponse>("/ventas/save", payload);
        toast.success("Venta guardada exitosamente");
        return data;
    },

    /** Lista ventas con filtros y paginación */
    listSales: async (params: ListSalesParams): Promise<ListSalesResponse> => {
        const { data } = await api.post<ListSalesResponse>("/ventas/list", params);
        return data;
    },

    /** Últimas 5 ventas — panel lateral o dashboard */
    listLast5Sales: async (): Promise<SaleList5last[]> => {
        const { data } = await api.get<SaleList5last[]>("/ventas/get5lastsales");
        return data;
    },

    /** Imprime ticket PDF (abre en nueva pestaña) */
    printTicketPDF: async (payload: any): Promise<void> => {
        const { data } = await api.post<{ base64: string }>("/pdf/ticket-pdf", payload);
        if (!data.base64) throw new Error("No se recibió base64 válido");
        await openBase64PDF(data.base64);
    },

    /** Imprime factura A4 PDF (abre en nueva pestaña) */
    printA4PDF: async (payload: any): Promise<void> => {
        const { data } = await api.post<{ base64: string }>("/pdf/a4-pdf", payload);
        if (!data.base64) throw new Error("No se recibió base64 válido");
        await openBase64PDF(data.base64);
    },
};

// Re-export del tipo Sale para uso externo
export type { Sale } from "../types/salesList.types";