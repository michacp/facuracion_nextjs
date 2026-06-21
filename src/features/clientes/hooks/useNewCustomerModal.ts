"use client";
// src/features/clientes/hooks/useNewCustomerModal.ts

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { clientesApi } from "../api/clientes.api";

export interface TipoIdentificacion {
    id: number | string;
    name: string;
}

export interface NuevoClienteForm {
    tipoIdentificacion: string;
    identificacion: string;
    razonSocial: string;
    direccion: string;
    email: string;
    telefono: string;
    camposAdicionales: { clave: string; valor: string }[];
}

export interface ClienteCreado {
    id: number;
    name: string;
    identification?: string;
}

interface Props {
    onSuccess: (cliente: ClienteCreado) => void;
    onClose: () => void;
}

export function useNewCustomerModal({ onSuccess, onClose }: Props) {
    const [tiposIdentificacion, setTiposIdentificacion] = useState<TipoIdentificacion[]>([]);
    const [saving, setSaving] = useState(false);

    const form = useForm<NuevoClienteForm>({
        defaultValues: {
            tipoIdentificacion: "",
            identificacion: "",
            razonSocial: "",
            direccion: "",
            email: "",
            telefono: "",
            camposAdicionales: [],
        },
    });

    const camposArray = useFieldArray({
        control: form.control,
        name: "camposAdicionales",
    });

    useEffect(() => {
        clientesApi.getNewData().then((data) => {
            setTiposIdentificacion(Array.isArray(data) ? data : []);
        }).catch(() => {
            toast.error("Error al cargar tipos de identificación");
        });
    }, []);

    const onSubmit = useCallback(
        async (values: NuevoClienteForm) => {
            setSaving(true);
            try {
                const response = await clientesApi.save({
                    ...values,
                    camposAdicionales: values.camposAdicionales.filter(
                        (c) => c.clave.trim() && c.valor.trim()
                    ),
                });
                toast.success("Cliente guardado exitosamente");

                const clienteCreado: ClienteCreado = {
                    id: response?.id ?? response,
                    name: values.razonSocial,
                    identification: values.identificacion,
                };

                onSuccess(clienteCreado);
                onClose();
            } catch (err) {
                toast.error("Error al guardar el cliente");
                console.error(err);
            } finally {
                setSaving(false);
            }
        },
        [onSuccess, onClose]
    );

    return { form, camposArray, tiposIdentificacion, saving, onSubmit };
}