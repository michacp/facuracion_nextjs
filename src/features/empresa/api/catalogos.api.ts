// src/features/empresa/api/catalogos.api.ts
//
// Nota: /catalogos/roles no es exclusivo de empresa. Si otro feature también
// lo necesita, vale la pena mover este archivo a shared/ más adelante.

import { api } from "@/shared/lib/axios";
import { Rol } from "../types/empresa.types";

export const catalogosApi = {
    getRoles: async (): Promise<Rol[]> => {
        const { data } = await api.get<Rol[]>("/catalogos/roles");
        return data;
    },
};