// src/features/proveedores/types/proveedor-list.types.ts

export interface ProveedorListItem {
    proveedor_id: number;
    identificacion: string;
    tipo_identificacion_nombre: string;
    razon_social: string;
    nombre_comercial: string;
    pais: string;
    email: string;
    telefono: string;
    total_compras: number;
}

export interface ListProveedoresResponse {
    total: number;
    proveedores: ProveedorListItem[];
}

export interface ListProveedoresParams {
    search?: string;
    page?: number;
    limit?: number;
}

export interface DeleteProveedorPayload {
    proveedor_id: number;
}

// ── Detalle ────────────────────────────────────────────────────────────────────

export interface ProveedorDetalle {
    proveedor_id: number;
    identificacion: string;
    tipo_identificacion: string;
    tipo_identificacion_nombre: string;
    razon_social: string;
    nombre_comercial: string;
    pais_id: number;
    pais_nombre: string;
    direccion: string;
    telefono: string;
    email: string;
}

// ── Update ─────────────────────────────────────────────────────────────────────

export interface ProveedorUpdatePayload {
    proveedor_id: number;
    identificacion: string;
    tipoIdentificacion: string;
    razonSocial: string;
    nombreComercial: string;
    paisId: number;
    direccion: string;
    telefono: string;
    email: string;
}

// Campos editables inline (excluye proveedor_id que es solo lectura)
export type ProveedorEditableField = Omit<ProveedorUpdatePayload, "proveedor_id">;
export type ProveedorEditableKey = keyof ProveedorEditableField;

// ── Catálogos (getnewdata) ─────────────────────────────────────────────────────

export interface ProveedorCatalogo {
    id: number | string;
    name: string;
}

export interface ProveedorNewData {
    tiposIdentificacion: ProveedorCatalogo[];
    paises: ProveedorCatalogo[];
}