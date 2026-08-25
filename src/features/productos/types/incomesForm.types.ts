// src/features/productos/components/IncomesForm/types.ts

export interface SelectOption {
    id: number;
    name: string;
}

export interface ProductOption {
    id: number;
    name: string;
    precio_actual: number;
    require_imei?: boolean; // ← NUEVO
}

export interface DetalleRow {
    item_id: number;
    nombre_visual: string;
    cantidad: number;
    costo_unitario: number;
    descuento_linea: number;
    subtotal_linea: number;
    precio_venta_sugerido: number;
    aplicar_pvp: boolean;
    require_imei: boolean;   // ← NUEVO
    imeis: string[];         // ← NUEVO
    row_id: string;
}

export interface IncomesFormState {
    proveedor_id: number | null;
    tipo_doc_id: number | null;
    estado_pago_id: number | null;
    compra_numero_documento: string;
    compra_fecha_emision: string;      // "yyyy-MM-dd"
    compra_subtotal: number;
    compra_descuento_global: number;
    compra_porcentaje_impuesto: number;
    compra_valor_impuesto: number;
    compra_gastos_envio: number;
    compra_total_pagar: number;
    observaciones: string;
    detalles: DetalleRow[];
}

export interface NewDataCompras {
    tiposDocumento: SelectOption[];
    estadosPago: SelectOption[];
}

export interface SaveCompraPayload {
    proveedor_id: number;
    tipo_doc_id: number;
    estado_pago_id: number;
    numero_documento: string;
    fecha_emision: string;
    subtotal: number;
    descuento_global: number;
    porcentaje_impuesto: number;
    valor_impuesto: number;
    gastos_envio: number;
    total_pagar: number;
    observaciones?: string;
    detalles: {
        item_id: number;
        cantidad: number;
        costo_unitario: number;
        descuento_linea?: number;
        precio_venta_sugerido?: number;
        aplicar_pvp: boolean;
        imeis?: string[]; // ← NUEVO
    }[];
}