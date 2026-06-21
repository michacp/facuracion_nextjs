// src/features/clientes/api/clientes.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import {
    ClienteDetalle,
    ClientesListSelect,
    DeleteClientePayload,
    EditClientePayload,
    GetClientePayload,
    ListClientesParams,
    ListClientesResponse,
} from "../types/clientes.types";

export const clientesApi = {
    /** Lista paginada con búsqueda libre */
    list: async (params: ListClientesParams): Promise<ListClientesResponse> => {
        const { data } = await api.post<ListClientesResponse>("/clientes/list", params);
        return data;
    },

    /** Trae el detalle completo de un cliente (incluye camposAdicionales) */
    get: async (payload: GetClientePayload): Promise<ClienteDetalle> => {
        const { data } = await api.post<ClienteDetalle>("/clientes/get", payload);
        return data;
    },

    /** Edita razonSocial, direccion, email, telefono y camposAdicionales de un cliente */
    edit: async (payload: EditClientePayload): Promise<void> => {
        await api.post("/clientes/edit", payload);
        toast.success("Cliente actualizado exitosamente");
    },

    /** Elimina un cliente por id */
    delete: async (payload: DeleteClientePayload): Promise<void> => {
        await api.post("/clientes/delete", payload);
        toast.success("Cliente eliminado exitosamente");
    },

    /** Datos iniciales del formulario de cliente (tipos de identificación, etc.) */
    getNewData: async (): Promise<any> => {
        const { data } = await api.get("/clientes/getnewdata");
        return data;
    },

    /** Busca clientes por DNI o Razón Social */
    find: async (params: { search: string }): Promise<ClientesListSelect[]> => {
        const { data } = await api.post<ClientesListSelect[]>("/clientes/find", params);
        return data;
    },

    /** Guarda un nuevo cliente */
    save: async (payload: any): Promise<any> => {
        const { data } = await api.post("/clientes/save", payload, {
            headers: { Accept: "application/json, text/plain" },
        });
        return data;
    },
};