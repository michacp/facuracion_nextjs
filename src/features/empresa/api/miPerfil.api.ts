// src/features/empresa/api/miPerfil.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import { ChangePasswordPayload, MiPerfil, MiPerfilUpdatePayload } from "../types/miPerfil.types";

export const miPerfilApi = {
    /** Trae el perfil del usuario logueado */
    getProfile: async (): Promise<MiPerfil> => {
        const { data } = await api.get<MiPerfil>("/empresa/mi-perfil");
        return data;
    },

    /** Actualiza nombre y/o email del usuario logueado */
    update: async (payload: MiPerfilUpdatePayload): Promise<void> => {
        await api.post("/empresa/mi-perfil/update", payload);
        toast.success("Perfil actualizado exitosamente");
    },

    /** Cambia la contraseña del usuario logueado */
    changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
        await api.post("/empresa/mi-perfil/cambiar-password", payload);
        toast.success("Contraseña actualizada exitosamente");
    },
};