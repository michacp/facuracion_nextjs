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

export const proveedorListApi = {
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