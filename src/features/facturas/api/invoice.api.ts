// src/features/ventas/api/invoice.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import {
    ListFacturasDto,
    ListFacturasResponse,
    PrintPdfDto,
    PrintPdfResponse,
    RetryFacturaDto,
    RetryFacturaResponse,
    SyncFacturaDto,
    SyncFacturaResponse,
} from "../types/invoice.types";

// ── Utilidad: base64 → Blob → nueva pestaña ──────────────────────────────────
// Equivalente al openPdfInTab() del Angular service

function openBase64Pdf(base64: string): void {
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const tab = window.open(url, "_blank");
    if (tab) tab.addEventListener("unload", () => URL.revokeObjectURL(url));
}

// ── API ──────────────────────────────────────────────────────────────────────

export const invoiceApi = {
    /** Lista paginada con filtros */
    listFacturas: async (dto: ListFacturasDto): Promise<ListFacturasResponse> => {
        const { data } = await api.post<ListFacturasResponse>("/facturas/list", dto);
        return data;
    },

    /** Sincroniza una factura con el SRI */
    syncFactura: async (dto: SyncFacturaDto): Promise<SyncFacturaResponse> => {
        const { data } = await api.post<SyncFacturaResponse>("/facturas/sync", dto);
        return data;
    },

    /** Reintenta el envío al SRI — muestra toast en éxito (equivale al tap del service) */
    retryFactura: async (dto: RetryFacturaDto): Promise<RetryFacturaResponse> => {
        const { data } = await api.post<RetryFacturaResponse>("/facturas/retry", dto);
        if (data.estado === "AUTORIZADO") {
            toast.success("Factura autorizada correctamente");
        }
        return data;
    },

    /** Imprime ticket térmico en nueva pestaña */
    printTicketPDF: async (dto: PrintPdfDto): Promise<void> => {
        const { data } = await api.post<PrintPdfResponse>("/pdf/ticket-pdf", dto);
        openBase64Pdf(data.base64);
    },

    /** Imprime RIDE / A4 en nueva pestaña */
    printA4PDF: async (dto: PrintPdfDto): Promise<void> => {
        const { data } = await api.post<PrintPdfResponse>("/pdf/a4-pdf", dto);
        openBase64Pdf(data.base64);
    },
};