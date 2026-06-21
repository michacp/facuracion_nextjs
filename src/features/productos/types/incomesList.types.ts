// src/features/productos/components/IncomesList/types.ts

export interface CompraItem {
    compra_id: number;
    numero_documento: string;
    tipo_documento: string;
    proveedor: string;
    proveedor_identificacion: string;
    fecha_emision: string;
    subtotal: number;
    valor_impuesto: number;
    total_pagar: number;
    total_pagado: number;
    estado_pago: string;
    total_items: number;
    total_unidades: number;
}

export interface EstadoPago {
    id: number;
    name: string;
}

export interface ListComprasParams {
    search?: string;
    estadoPago?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page: number;
    limit: number;
}

export interface ListComprasResponse {
    compras: CompraItem[];
    total: number;
    estadosPago: EstadoPago[];
}