// src/features/productos/api/compras.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export interface NewDataCompras {
    tiposDocumento: { id: number; name: string }[];
    estadosPago: { id: number; name: string }[];
    tiposIdentificacion: { id: string; name: string }[];
    paises: { id: number; name: string }[];
}

export interface SaveCompraResponse {
    compra_id: number;
    numero_documento: string;
    total_pagar: number;
    detalles: {
        detalle_id: number;
        item_id: number;
        lote_id: number;
        cantidad: number;
        pvp_actualizado?: boolean;
        imeis_registrados?: number | null; // ← NUEVO
    }[];
}

// ── API ────────────────────────────────────────────────────────────────────

export const comprasApi = {
    getNewData: async (): Promise<NewDataCompras> => {
        const { data } = await api.get<NewDataCompras>("/compras/getnewdata");
        return data;
    },

    save: async (payload: any): Promise<SaveCompraResponse> => {
        const { data } = await api.post<SaveCompraResponse>("/compras/save", payload);
        toast.success("Ingreso procesado correctamente");
        return data;
    },

    listCompras: async (params: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/list", params);
        return data;
    },

    getDetail: async (body: { compra_id: number }): Promise<any> => {
        const { data } = await api.post<any>("/compras/detail", body);
        return data;
    },

    updateField: async (payload: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/update-field", payload);
        return data;
    },

    addItem: async (payload: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/add-item", payload);
        return data;
    },

    removeItem: async (payload: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/remove-item", payload);
        return data;
    },
};