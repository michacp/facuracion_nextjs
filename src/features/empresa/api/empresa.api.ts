// src/features/empresa/api/empresa.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import {
    DeleteSucursalPayload,
    DeleteUsuarioPayload,
    EmpresaProfile,
    EmpresaUpdatePayload,
    SaveSucursalPayload,
    SaveUsuarioPayload,
} from "../types/empresa.types";

export const empresaApi = {
    /** Trae perfil completo: empresa, suscripción, sucursales, usuarios, firma */
    getProfile: async (): Promise<EmpresaProfile> => {
        const { data } = await api.get<EmpresaProfile>("/empresa/profile");
        console.log(data)
        return data;
    },

    /** Actualiza los datos editables de la empresa (no incluye el RUC) */
    update: async (payload: EmpresaUpdatePayload): Promise<void> => {
        await api.post("/empresa/update", payload);
        toast.success("Empresa actualizada exitosamente");
    },

    /** Crea o edita una sucursal (sucursales_id presente = edición) */
    saveSucursal: async (payload: SaveSucursalPayload): Promise<void> => {
        await api.post("/empresa/sucursal/save", payload);
        toast.success(payload.sucursales_id ? "Sucursal actualizada exitosamente" : "Sucursal creada exitosamente");
    },

    /** Elimina una sucursal (físico si no tiene ventas; el backend valida matriz/última/ventas) */
    deleteSucursal: async (payload: DeleteSucursalPayload): Promise<void> => {
        await api.post("/empresa/sucursal/delete", payload);
        toast.success("Sucursal eliminada exitosamente");
    },

    /** Crea un usuario nuevo o edita un vínculo existente (usuario_empresa_id presente = edición) */
    saveUsuario: async (payload: SaveUsuarioPayload): Promise<void> => {
        await api.post("/empresa/usuario/save", payload);
        toast.success(payload.usuario_empresa_id ? "Usuario actualizado exitosamente" : "Usuario agregado exitosamente");
    },

    /** Elimina (soft delete) el vínculo usuario-empresa; el usuario global no se borra */
    deleteUsuario: async (payload: DeleteUsuarioPayload): Promise<void> => {
        await api.post("/empresa/usuario/delete", payload);
        toast.success("Usuario eliminado exitosamente");
    },
};