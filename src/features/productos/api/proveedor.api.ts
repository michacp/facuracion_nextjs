// src/features/productos/api/proveedor.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProveedorNewData {
    tiposIdentificacion: { id: string; name: string }[];
    paises: { id: number; name: string }[];
}

export interface ProveedorIdName {
    id: number;
    name: string;
}

// ── API ────────────────────────────────────────────────────────────────────

export const proveedorApi = {
    /** Datos iniciales: tipos de identificación, países */
    getNewData: async (): Promise<ProveedorNewData> => {
        const { data } = await api.get<ProveedorNewData>("/proveedores/getnewdata");
        return data;
    },

    /** Guarda un nuevo proveedor */
    save: async (payload: any): Promise<ProveedorIdName> => {
        const { data } = await api.post<ProveedorIdName>("/proveedores/save", payload);
        toast.success("Proveedor guardado exitosamente");
        return data;
    },

    /** Busca proveedores (con búsqueda opcional por texto) */
    find: async (params: { search?: string }): Promise<ProveedorIdName[]> => {
        const { data } = await api.post<ProveedorIdName[]>("/proveedores/find", params);
        return data;
    },
};