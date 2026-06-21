// src/features/productos/types/product.types.ts

export interface TypeItem {
    id: number;
    name: string;
}

export interface Brand {
    id: number;
    name: string;
}

export interface Model {
    id: number;
    name: string;
}

export interface Tax {
    id: number;
    name: string;
}

export interface Percentaje {
    id: number;
    name: string;
}

export interface InitialData {
    taxes: Tax[];
    brands: Brand[];
    type: TypeItem[];
}

export interface FindModelsRequest {
    id: number;
}

export interface FindPercentajesRequest {
    id: number;
}

export interface ProductoList {
    nombre: string;
    codigo: string;
    marcas: string;
    modelos: string;
    precio: number;
    stock: number;
    impuesto_nombre: string;
}

export interface SaveProductoDto {
    tipo_item: number;
    nombre: string;
    descripcion: string;
    precio_unitario: number;
    id_tarifa_impuesto: number;
    modelos_ids: number[];
}