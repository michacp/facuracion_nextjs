// src/features/reportes/types/reportes.types.ts
import type { SaleList5last } from "@/features/ventas/types/saleForm.types";

// ── Dashboard / KPIs ──────────────────────────────────────────────────────────

export interface KpiPeriodo {
    ventas_total: number;
    ventas_count: number;
    compras_total: number;
    compras_count: number;
    utilidad_bruta: number;
}

export interface KpisResponse {
    dia: KpiPeriodo;
    semana: KpiPeriodo;
    mes: KpiPeriodo;
    anio: KpiPeriodo;
}

export interface VentaSemana {
    label: string;
    fecha_inicio: string;
    fecha_fin: string;
    total_ventas: number;
    count_ventas: number;
    total_compras: number;
    count_compras: number;
}

export interface VentasSemanaResponse {
    semanas: VentaSemana[];
}

export interface ProductoStockBajo {
    item_id: number;
    codigo: string;
    nombre: string;
    stock_total: number;
    umbral: number;
    modelos: string[] | null;
}

export interface StockBajoResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    items: ProductoStockBajo[];
}
export interface StockBajoParams {
    umbral?: number;
    page?: number; // base 0, como lo espera el backend
    limit?: number;
}

export interface FirmaPorVencer {
    firmas_id: number;
    alias: string;
    fecha_expiracion: string;
    dias_restantes: number;
}

export interface FacturaPendiente {
    factura_id: number;
    numero_venta: string;
    estado: string;
    fecha_envio_sri: string;
}

export interface CompraPorPagar {
    compra_id: number;
    numero_documento: string;
    proveedor: string;
    saldo_pendiente: number;
    estado_pago: string;
}

export interface AlertasResponse {
    firmas_por_vencer: FirmaPorVencer[];
    facturas_pendientes: FacturaPendiente[];
    compras_por_pagar: CompraPorPagar[];
    total_alertas: number;
}

export interface TopProducto {
    item_id: number;
    codigo: string;
    nombre: string;
    unidades_vendidas: number;
    total_facturado: number;
    marcas: string;
}

export interface TopProductosResponse {
    productos: TopProducto[];
    periodo: string;
}

export interface TopCliente {
    cliente_id: number;
    razon_social: string;
    identificacion: string;
    total_compras: number;
    total_facturado: number;
}

export interface TopClientesResponse {
    clientes: TopCliente[];
    periodo: string;
}

export interface DashboardData {
    kpis: KpisResponse;
    ventasSemanas: VentasSemanaResponse;
    alertas: AlertasResponse;
    topProductos: TopProductosResponse;
    topClientes: TopClientesResponse;
    ultimasVentas: SaleList5last[];
}

// ── IVA Mensual ───────────────────────────────────────────────────────────────

export interface IvaResumenItem {
    tarifa_porcentaje: number;
    base_imponible: number;
    iva: number;
    cantidad_registros: number;
}

export interface IvaDetalleVenta {
    venta_id: number;
    numero_venta: string;
    fecha_emision: string;
    cliente: string;
    identificacion: string;
    item_nombre: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    base_imponible: number;
    tarifa_porcentaje: number;
    iva_calculado: number;
}

export interface IvaDetalleCompra {
    compra_id: number;
    numero_documento: string;
    fecha_emision: string;
    proveedor: string;
    proveedor_identificacion: string;
    base_imponible: number;
    tarifa_porcentaje: number;
    iva: number;
}

/** Respuesta del resumen — sin detalle (los detalles vienen paginados) */
export interface IvaMensualResponse {
    mes: number;
    anio: number;
    resumen_ventas: IvaResumenItem[];
    resumen_compras: IvaResumenItem[];
    iva_total_ventas: number;
    iva_total_compras: number;
    iva_a_pagar: number;
}

export interface IvaMensualParams {
    mes: number;
    anio: number;
}

export interface ListIvaDetalleParams {
    mes: number;
    anio: number;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ListIvaVentasResponse {
    total: number;
    detalle: IvaDetalleVenta[];
}

export interface ListIvaComprasResponse {
    total: number;
    detalle: IvaDetalleCompra[];
}

// ── Inventario Valorado ───────────────────────────────────────────────────────

export interface LoteItem {
    lote_id: number;
    numero_lote: string;
    cantidad: number;
    costo_origen: number;
    valor_lote: number;
}

export interface InventarioItem {
    item_id: number;
    codigo: string;
    nombre: string;
    stock_total: number;
    costo_promedio: number;
    valor_total: number;
    lotes: LoteItem[];
}

export interface InventarioValoradoResponse {
    fecha_corte: string;
    total_items: number;
    valor_total_inventario: number;
    items: InventarioItem[];
}

// ── Cuentas por Pagar ─────────────────────────────────────────────────────────

export type EstadoPago = "PENDIENTE" | "PARCIAL" | "PAGADO";

export interface CompraProveedor {
    compra_id: number;
    numero_documento: string;
    fecha_emision: string;
    total_pagar: number;
    total_pagado: number;
    saldo_pendiente: number;
    estado_pago: EstadoPago;
    dias_antiguedad: number;
}

export interface ProveedorCuentas {
    proveedor_id: number;
    razon_social: string;
    identificacion: string;
    saldo_total: number;
    compras: CompraProveedor[];
}

export interface CuentasPorPagarResponse {
    fecha_corte: string;
    total_por_pagar: number;
    total_proveedores: number;
    proveedores: ProveedorCuentas[];
}