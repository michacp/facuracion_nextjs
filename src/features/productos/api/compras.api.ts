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
    }[];
}

// ── API ────────────────────────────────────────────────────────────────────

export const comprasApi = {
    /** Datos iniciales: tipos de documento, estados de pago, etc. */
    getNewData: async (): Promise<NewDataCompras> => {
        const { data } = await api.get<NewDataCompras>("/compras/getnewdata");
        return data;
    },

    /** Guarda un nuevo ingreso de mercadería */
    save: async (payload: any): Promise<SaveCompraResponse> => {
        const { data } = await api.post<SaveCompraResponse>("/compras/save", payload);
        toast.success("Ingreso procesado correctamente");
        return data;
    },

    /** Lista compras con filtros/paginación */
    listCompras: async (params: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/list", params);
        return data;
    },

    /** Detalle de una compra */
    getDetail: async (body: { compra_id: number }): Promise<any> => {
        const { data } = await api.post<any>("/compras/detail", body);
        return data;
    },

    /** Actualiza un campo puntual de la compra */
    updateField: async (payload: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/update-field", payload);
        return data;
    },

    /** Agrega un ítem a una compra existente */
    addItem: async (payload: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/add-item", payload);
        return data;
    },

    /** Elimina un ítem de una compra existente */
    removeItem: async (payload: any): Promise<any> => {
        const { data } = await api.post<any>("/compras/remove-item", payload);
        return data;
    },
};