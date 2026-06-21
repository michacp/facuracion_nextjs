"use client";
// src/features/clientes/hooks/useEditCustomerModal.ts

import { useCallback, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { clientesApi } from "../api/clientes.api";
import { ClienteListItem } from "../types/clientes.types";

export interface EditClienteForm {
    razonSocial: string;
    direccion: string;
    email: string;
    telefono: string;
    camposAdicionales: { clave: string; valor: string }[];
}

interface Props {
    cliente: ClienteListItem;
    onSuccess: () => void;
    onClose: () => void;
}

export function useEditCustomerModal({ cliente, onSuccess, onClose }: Props) {
    const [loadingDetail, setLoadingDetail] = useState(true);
    const [saving, setSaving] = useState(false);

    const form = useForm<EditClienteForm>({
        defaultValues: {
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

    // Carga el detalle completo (con camposAdicionales) al abrir el modal
    useEffect(() => {
        setLoadingDetail(true);
        clientesApi
            .get({ id: cliente.id })
            .then((detalle) => {
                form.reset({
                    razonSocial: detalle.razon_social,
                    direccion: detalle.direccion ?? "",
                    email: detalle.email ?? "",
                    telefono: detalle.telefono ?? "",
                    camposAdicionales: detalle.camposAdicionales ?? [],
                });
            })
            .finally(() => setLoadingDetail(false));
    }, [cliente.id, form]);

    const onSubmit = useCallback(
        async (values: EditClienteForm) => {
            setSaving(true);
            try {
                await clientesApi.edit({
                    id: cliente.id,
                    razonSocial: values.razonSocial,
                    direccion: values.direccion || undefined,
                    email: values.email || undefined,
                    telefono: values.telefono || undefined,
                    camposAdicionales: values.camposAdicionales.filter(
                        (c) => c.clave.trim() && c.valor.trim()
                    ),
                });
                onSuccess();
                onClose();
            } catch {
                // El interceptor global de axios ya muestra el toast de error
            } finally {
                setSaving(false);
            }
        },
        [cliente.id, onSuccess, onClose]
    );

    return { form, camposArray, loadingDetail, saving, onSubmit };
}