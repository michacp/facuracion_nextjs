export interface SaveItemResponseDto {
    itemId: number;
    id: number;
    name: string;
    cod: string;
    es_servicio: boolean;
    precio_actual: number;
    require_imei?: boolean;
    imeis_registrados?: number | null;
}