// src/features/ventas/components/SalesList/types.ts

export interface SaleItem {
    code: string;
    name: string;
    lot: string | null;
    es_servicio: boolean;
}

export interface Sale {
    sale_number: string;
    customer: string;
    issue_date: string;
    document_type: string;
    payment_method: string;
    total_amount: number;
    items: SaleItem[];
}

export interface ListSalesParams {
    filters: {
        searchQuery: string;
        forma_pago: string;
        pageIndex: number;
        pageSize: number;
    };
}

export interface ListSalesResponse {
    sales: Sale[];
    total: number;
}

export const FORMA_PAGO_OPTIONS = [
    { value: "", label: "Todas" },
    { value: "SIN UTILIZACIÓN DEL SISTEMA FINANCIERO", label: "Sin uso financiero" },
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TARJETA", label: "Tarjetas" },
] as const;

export const PAGE_SIZE_OPTIONS = [30, 50, 100, 200];