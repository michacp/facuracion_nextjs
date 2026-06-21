"use client";

import { useEffect, useState } from "react";
import { catalogosApi } from "../api/catalogos.api";
import { Rol } from "../types/empresa.types";

export function useRoles() {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await catalogosApi.getRoles();
                setRoles(data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { roles, loading };
}