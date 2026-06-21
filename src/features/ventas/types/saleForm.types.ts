// src/features/ventas/types/saleForm.types.ts

export interface ClientesListSelect {
    id: number | string;
    name: string;
    identification?: string;
    [key: string]: any;
}

export interface ProductosListSelect {
    id: number | string;
    name: string;
    price: number;
    es_servicio: boolean;
    tax_percentage_id: number | string;
    [key: string]: any;
}

export interface ImpuestoSales {
    id: number | string;
    name: string;
    percentage: number | string;
}

export interface TipoComprobante {
    id: number | string;
    name: string;
}

export interface FormaPago {
    id: number | string;
    name: string;
}

export interface SaleItem {
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface SaleList5last {
    saleId: number | string;
    saleNumber: string;
    issueDate: string;
    totalAmount: number | string;
    items: SaleItem[];
}

export interface ProductoLinea {
    productoId: number | string;
    es_servicio: boolean;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    codigoImpuesto: number | string;
}

export interface FacturaFormValues {
    clienteId: number | string | null;
    fechaEmision: Date;
    tipoComprobante: number | string;
    moneda: string;
    formaPago: number | string;
    plazoPago: string;
    observaciones: string;
    productos: ProductoLinea[];
    subtotal: number;
    descuentoTotal: number;
    iva: number;
    propina: number;
    total: number;
}

// UI-only state
export interface ProductoUI {
    nombre: string;
    esServicio: boolean;
}

export interface NewDataVentas {
    clientes: ClientesListSelect[];
    productos: ProductosListSelect[];
    impuestos: ImpuestoSales[];
    vouchertype: TipoComprobante[];
    formapago: FormaPago[];
}

export interface SaveSaleResult {
    title: string;
    message: string;
    success: boolean;
    ventaId?: number | string | null;
}