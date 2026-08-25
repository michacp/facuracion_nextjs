// src/features/productos/api/imei.api.ts
import { api } from "@/shared/lib/axios";
import type {
    CheckImeisDisponibilidadResponse,
    RegistrarImeisResponse,
} from "../types/imei.types";

export const imeiApi = {
    /** Verifica disponibilidad de una lista de IMEIs (sin registrarlos) */
    checkDisponibilidad: async (
        imeis: string[]
    ): Promise<CheckImeisDisponibilidadResponse> => {
        const { data } = await api.post<CheckImeisDisponibilidadResponse>(
            "/imei/check-disponibilidad",
            { imeis }
        );
        return data;
    },

    /** Registra IMEIs para un lote ya creado (uso fuera del flujo de compras/save) */
    registrar: async (
        lote_id: number,
        imeis: string[]
    ): Promise<RegistrarImeisResponse> => {
        const { data } = await api.post<RegistrarImeisResponse>("/imei/registrar", {
            lote_id,
            imeis,
        });
        return data;
    },
};