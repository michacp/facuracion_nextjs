// src/features/productos/components/NewProveedorModal/types.ts

export interface SelectOption {
    id: number | string;
    name: string;
}

export interface ProveedorNewData {
    tiposIdentificacion: SelectOption[];
    paises: SelectOption[];
}

export interface NewProveedorForm {
    identificacion: string;
    tipoIdentificacion: string;
    razonSocial: string;
    nombreComercial: string;
    paisId: number | null;
    direccion: string;
    telefono: string;
    email: string;
}

export interface NewProveedorResult {
    id: number;
    name: string;
}