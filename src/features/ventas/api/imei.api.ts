// src/features/ventas/api/imei.api.ts
import { api } from "@/shared/lib/axios";

export interface ImeiDisponibleLote {
    imei_id: number;
    imei: string;
}

export interface ImeisDisponiblesLoteResponse {
    lote_id: number;
    imeis: ImeiDisponibleLote[];
}

export const imeiSaleApi = {
    findDisponiblesByLote: async (lote_id: number): Promise<ImeisDisponiblesLoteResponse> => {
        const { data } = await api.post<ImeisDisponiblesLoteResponse>(
            "/imei/disponibles-by-lote",
            { lote_id }
        );
        return data;
    },
};