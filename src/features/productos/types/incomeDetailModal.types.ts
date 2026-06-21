// src/features/productos/components/IncomeDetailModal/types.ts

export interface DetalleItem {
    detalle_id: number;
    codigo: string;
    nombre: string;
    numero_lote: string | null;
    cantidad: number;
    costo_unitario: number;
    descuento_linea: number;
    subtotal_linea: number;
    precio_venta_sugerido: number | null;
    aplicar_pvp: boolean;
}

export interface CompraDetalle {
    compra_id: number;
    numero_documento: string;
    tipo_documento: string;
    fecha_emision: string;
    usuario_registro: string;
    proveedor: string;
    proveedor_identificacion: string;
    proveedor_nombre_comercial: string | null;
    proveedor_email: string | null;
    proveedor_telefono: string | null;
    proveedor_pais: string | null;
    estado_pago: string;
    subtotal: number;
    descuento_global: number;
    porcentaje_impuesto: number;
    valor_impuesto: number;
    gastos_envio: number;
    total_pagar: number;
    total_pagado: number;
    saldo_pendiente: number;
    observaciones: string | null;
    detalles: DetalleItem[];
}

export interface SelectOption {
    id: number;
    name: string;
}

// Campo editable — equivale a editingField + editControl en Angular
export type EditableField =
    | "numero_documento"
    | "tipo_doc_id"
    | "fecha_emision"
    | "estado_pago_id"
    | "descuento_global"
    | "gastos_envio"
    | "observaciones"
    | null;

export interface AddItemForm {
    item_id: number | null;
    nombre_visual: string;
    cantidad: number;
    costo_unitario: number;
    descuento_linea: number;
    precio_venta_sugerido: number;
    aplicar_pvp: boolean;
}