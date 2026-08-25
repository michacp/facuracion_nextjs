// src/features/productos/types/imei.types.ts

export type MotivoNoDisponible = "YA_REGISTRADO" | "DUPLICADO_EN_LISTA";

export interface ImeiDisponibilidadItem {
    imei: string;
    disponible: boolean;
    motivo?: MotivoNoDisponible | null;
}

export interface CheckImeisDisponibilidadResponse {
    todos_disponibles: boolean;
    resultados: ImeiDisponibilidadItem[];
}

export interface RegistrarImeisResponse {
    registrados: number;
    duplicados: number;
    imeis_registrados: string[];
    imeis_duplicados: string[];
}