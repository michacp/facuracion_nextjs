// src/features/productos/types/product-list.types.ts
// (extiende o convive con product.types.ts que ya tienes)

export interface ProductoListItem {
    id: number;
    codigo: string;
    nombre: string;
    precio: number;
    stock: number;
    tipo_nombre: string;
    impuesto_nombre: string;
    impuesto_tipo_nombre: string;
    marcas: string;
    modelos: string;
}

export interface ListProductosParams {
    search: string;
    category: number | string;
    page: number;
    limit: number;
}

export interface ListProductosResponse {
    items: ProductoListItem[];
    total: number;
    categories: { id: number; name: string }[];
}