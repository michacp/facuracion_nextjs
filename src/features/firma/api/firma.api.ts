// src/features/firma/api/firma.api.ts
import { api } from "@/shared/lib/axios";
import { toast } from "sonner";
import { SaveSignatureResponse, SignatureStatus } from "../types/firma.types";

export const firmaApi = {
    /** Obtiene el estado actual de la firma digital */
    getStatus: async (): Promise<SignatureStatus | null> => {
        const { data } = await api.get<SignatureStatus>("/firmas/status");
        return data;
    },

    /** Sube un archivo .p12 con su contraseña */
    saveSignature: async (file: File, password: string): Promise<SaveSignatureResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("password", password);

        const { data } = await api.post<SaveSignatureResponse>("/firmas/save", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Firma subida exitosamente");
        return data;
    },
};