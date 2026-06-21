// src/features/clientes/types/clientes.types.ts

export interface ClientesListSelect {
    id: number;
    name: string;
    identification?: string;
    [key: string]: any;
}

export interface CampoAdicional {
    clave: string;
    valor: string;
}

export interface ClienteListItem {
    id: number;
    razon_social: string;
    identificacion: string;
    tipo_identificacion: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
}

export interface ListClientesResponse {
    total: number;
    clientes: ClienteListItem[];
}

export interface ListClientesParams {
    search?: string;
    page?: number;
    limit?: number;
}

export interface GetClientePayload {
    id: number;
}

export interface ClienteDetalle {
    id: number;
    identificacion: string;
    tipo_identificacion: string;
    tipo_identificacion_nombre: string;
    razon_social: string;
    direccion: string | null;
    email: string | null;
    telefono: string | null;
    es_consumidor_final: boolean;
    camposAdicionales: CampoAdicional[];
}

export interface EditClientePayload {
    id: number;
    razonSocial: string;
    direccion?: string;
    email?: string;
    telefono?: string;
    camposAdicionales?: CampoAdicional[];
}

export interface DeleteClientePayload {
    id: number;
}