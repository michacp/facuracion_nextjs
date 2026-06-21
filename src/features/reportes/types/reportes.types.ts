// src/features/reportes/types.ts

// ── /reportes/kpis ──────────────────────────────────────────────────────────
export interface KpiPeriodo {
    ventas_total: number;
    ventas_count: number;
    compras_total: number;
    compras_count: number;
    utilidad_bruta: number;
}

export interface KpisResponse {
    semana: KpiPeriodo;
    mes: KpiPeriodo;
    anio: KpiPeriodo;
}

// ── /reportes/ventas-semanas ────────────────────────────────────────────────
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

// ── /reportes/stock-bajo ────────────────────────────────────────────────────
export interface ProductoStockBajo {
    item_id: number;
    codigo: string;
    nombre: string;
    stock_total: number;
    umbral: number;
    modelos: string;
}

export interface StockBajoResponse {
    total: number;
    items: ProductoStockBajo[];
}

// ── /reportes/alertas ───────────────────────────────────────────────────────
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

// ── /reportes/top-productos ─────────────────────────────────────────────────
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

// ── /reportes/top-clientes ──────────────────────────────────────────────────
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

// ── Tipo agregado para el hook useDashboard ─────────────────────────────────
export interface DashboardData {
    kpis: KpisResponse;
    ventasSemanas: VentasSemanaResponse;
    stockBajo: StockBajoResponse;
    alertas: AlertasResponse;
    topProductos: TopProductosResponse;
    topClientes: TopClientesResponse;
}