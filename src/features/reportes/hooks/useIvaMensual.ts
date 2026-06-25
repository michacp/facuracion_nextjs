"use client";
// src/features/reportes/hooks/useIvaMensual.ts

import { useCallback, useState } from "react";
import { reportesApi } from "../api/reportes.api";
import { IvaMensualResponse } from "../types/reportes.types";

function currentMonth() {
    const now = new Date();
    return { mes: now.getMonth() + 1, anio: now.getFullYear() };
}

export function useIvaMensual() {
    const [mes, setMes] = useState(currentMonth().mes);
    const [anio, setAnio] = useState(currentMonth().anio);

    const [data, setData] = useState<IvaMensualResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const fetchReporte = useCallback(async (m: number, a: number) => {
        setLoading(true);
        try {
            const res = await reportesApi.getIvaMensual({ mes: m, anio: a });
            setData(res);
            setLoaded(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleMesChange = (value: number) => setMes(value);
    const handleAnioChange = (value: number) => setAnio(value);

    const handleConsultar = () => fetchReporte(mes, anio);

    return {
        mes, anio, data, loading, loaded,
        handleMesChange, handleAnioChange, handleConsultar,
    };
}