// src/features/firma/hooks/useFirma.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { firmaApi } from "../api/firma.api";
import { SignatureStatus } from "../types/firma.types";

export function useFirma() {
    const [signatureStatus, setSignatureStatus] = useState<SignatureStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStatus = useCallback(async () => {
        setLoading(true);
        try {
            const status = await firmaApi.getStatus();
            setSignatureStatus(status);
        } catch (err) {
            console.error("Error al obtener estado de firma:", err);
            toast.error("No se pudo obtener el estado de la firma");
            setSignatureStatus(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    return { signatureStatus, loading, reload: loadStatus };
}