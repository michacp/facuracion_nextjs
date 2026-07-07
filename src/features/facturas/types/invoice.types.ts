// src/features/ventas/types/invoice.types.ts

export interface FacturaItem {
    factura_id: number;
    venta_id: number;
    numero_venta: string;
    cliente: string;
    identificacion: string;
    fecha_emision: string;
    total: number;
    estado: string;
    fecha_autorizacion: string | null;
    ambiente: number;
    clave_acceso: string;
    tiene_xml: boolean;
    mensaje_sri: string | null;
}

export interface EstadoItem {
    id: number;
    name: string;
}

// ── Request DTOs ─────────────────────────────────────────────────────────────

export interface ListFacturasDto {
    search?: string;
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page: number;
    limit: number;
}

export interface SyncFacturaDto { factura_id: number; }
export interface RetryFacturaDto { factura_id: number; }
export interface PrintPdfDto { id: number; }

// ── Response DTOs ────────────────────────────────────────────────────────────

export interface ListFacturasResponse {
    facturas: FacturaItem[];
    total: number;
    estados: EstadoItem[];
}

export interface SyncFacturaResponse {
    cambio: boolean;
    estadoNuevo: string;
    fechaAutorizacion: string | null;
    xmlActualizado: boolean;
}

export interface RetryFacturaResponse {
    estado: string;
    fechaAutorizacion: string | null;
}

export interface PrintPdfResponse {
    base64: string;
}

export interface SendEmailDto { venta_id: number; }
export interface SendEmailResponse {
    success: boolean;
    mensaje: string;
    destinatarios: string[];
}