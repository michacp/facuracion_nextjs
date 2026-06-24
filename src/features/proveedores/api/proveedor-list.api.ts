// src/features/proveedores/api/proveedor-list.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import {
    DeleteProveedorPayload,
    ListProveedoresParams,
    ListProveedoresResponse,
    ProveedorDetalle,
    ProveedorNewData,
    ProveedorUpdatePayload,
} from "../types/proveedor-list.types";
import { NewProveedorResult } from "../types/newProveedor.types";

export const proveedorListApi = {

    /** Guarda un nuevo proveedor */
    save: async (payload: any): Promise<NewProveedorResult> => {
        const { data } = await api.post<NewProveedorResult>("/proveedores/save", payload);
        toast.success("Proveedor guardado exitosamente");
        return data;
    },

    /** Busca proveedores (con búsqueda opcional por texto) */
    find: async (params: { search?: string }): Promise<NewProveedorResult[]> => {
        const { data } = await api.post<NewProveedorResult[]>("/proveedores/find", params);
        return data;
    },

    list: async (params: ListProveedoresParams): Promise<ListProveedoresResponse> => {
        const { data } = await api.post<ListProveedoresResponse>("/proveedores/list", params);
        return data;
    },

    get: async (proveedor_id: number): Promise<ProveedorDetalle> => {
        const { data } = await api.post<ProveedorDetalle>("/proveedores/get", { proveedor_id });
        return data;
    },

    getNewData: async (): Promise<ProveedorNewData> => {
        const { data } = await api.get<ProveedorNewData>("/proveedores/getnewdata");
        return data;
    },

    update: async (payload: ProveedorUpdatePayload): Promise<void> => {
        await api.post("/proveedores/update", payload);
        toast.success("Proveedor actualizado exitosamente");
    },

    delete: async (payload: DeleteProveedorPayload): Promise<void> => {
        await api.post("/proveedores/delete", payload);
        toast.success("Proveedor eliminado exitosamente");
    },
};