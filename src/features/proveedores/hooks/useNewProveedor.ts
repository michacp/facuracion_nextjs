"use client";
// src/features/proveedores/hooks/useNewProveedor.ts

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { proveedorListApi } from "../api/proveedor-list.api";
import type {
    NewProveedorForm,
    NewProveedorResult,
    ProveedorNewData,
} from "../types/newProveedor.types";

const EMPTY: NewProveedorForm = {
    identificacion: "",
    tipoIdentificacion: "",
    razonSocial: "",
    nombreComercial: "",
    paisId: null,
    direccion: "",
    telefono: "",
    email: "",
};

export interface FormErrors {
    identificacion?: string;
    tipoIdentificacion?: string;
    razonSocial?: string;
    paisId?: string;
    email?: string;
}

function validate(form: NewProveedorForm): FormErrors {
    const errors: FormErrors = {};
    if (!form.identificacion.trim()) errors.identificacion = "Requerido";
    else if (form.identificacion.length > 20) errors.identificacion = "Máximo 20 caracteres";
    if (!form.tipoIdentificacion) errors.tipoIdentificacion = "Requerido";
    if (!form.razonSocial.trim()) errors.razonSocial = "Requerido";
    else if (form.razonSocial.length > 150) errors.razonSocial = "Máximo 150 caracteres";
    if (!form.paisId) errors.paisId = "Requerido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Email no válido";
    return errors;
}

export function useNewProveedor(onClose: (result: NewProveedorResult | null) => void) {
    const [newData, setNewData] = useState<ProveedorNewData>({ tiposIdentificacion: [], paises: [] });
    const [form, setForm] = useState<NewProveedorForm>(EMPTY);
    const [touched, setTouched] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(false);

    const errors = validate(form);
    const isValid = Object.keys(errors).length === 0;

    function patch(partial: Partial<NewProveedorForm>) {
        setForm((prev) => ({ ...prev, ...partial }));
    }

    useEffect(() => {
        (async () => {
            setLoadingData(true);
            try {
                const data = await proveedorListApi.getNewData();
                setNewData(data);
                // Preseleccionar Ecuador
                const ecuador = data.paises.find((p) => p.name.toUpperCase().includes("ECUADOR"));
                if (ecuador) patch({ paisId: ecuador.id as number });
            } catch (err) {
                console.error("Error cargando datos de proveedor:", err);
                toast.error("Error al cargar datos");
            } finally {
                setLoadingData(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function guardar() {
        setTouched(true);
        if (!isValid) return;

        const payload = Object.fromEntries(
            Object.entries(form).filter(([_, v]) => v !== "" && v !== null)
        );

        setLoading(true);
        try {
            const result = await proveedorListApi.save(payload);
            onClose(result);
        } catch (err) {
            console.error("Error guardando proveedor:", err);
            toast.error("Error al guardar proveedor");
        } finally {
            setLoading(false);
        }
    }

    function cancelar() { onClose(null); }

    function fieldError(campo: keyof FormErrors): string | undefined {
        return touched ? errors[campo] : undefined;
    }

    return {
        newData, form, patch,
        loadingData, loading, isValid,
        guardar, cancelar, fieldError,
    };
}