// src/features/ventas/types/salesList.types.ts

export interface SaleItem {
    code: string;
    name: string;
    lot: string | null;
    es_servicio: boolean;
}

export interface Sale {
    sale_id: number;
    sale_number: string;
    customer: string;
    issue_date: string;
    document_type: string;
    payment_method: string;
    total_amount: number;
    items: SaleItem[];
}

export interface TipoComprobante {
    id: number;
    name: string;
}

export interface ListSalesParams {
    filters: {
        searchQuery: string;
        tipo_comprobante_id: number | null;
        fechaDesde: string | null;
        fechaHasta: string | null;
        pageIndex: number;
        pageSize: number;
    };
}

export interface ListSalesResponse {
    sales: Sale[];
    total: number;
    tiposComprobante: TipoComprobante[];
}

export const PAGE_SIZE_OPTIONS = [30, 50, 100, 200];