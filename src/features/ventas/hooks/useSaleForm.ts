// src/features/ventas/hooks/useSaleForm.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { saleApi } from "../api/sale.api";
import { clientesApi } from "@/features/clientes/api/clientes.api";
import { productApi } from "@/features/productos/api/product.api";
import {
    calcularTotales,
    formatDateToLocalString,
    parseSaveResponse,
} from "../utils/saleForm.utils";
import type {
    FacturaFormValues,
    ImpuestoSales,
    TipoComprobante,
    FormaPago,
    SaleList5last,
    ProductoUI,
    SaveSaleResult,
    NewDataVentas,
    ProductosListSelect,
} from "../types/saleForm.types";
import type { Item } from "@/components/common/GenericSelector/types";

function todayString(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const defaultValues: FacturaFormValues = {
    clienteId: null,
    fechaEmision: todayString() as any,
    tipoComprobante: "",
    moneda: "USD",
    formaPago: "",
    plazoPago: "",
    observaciones: "",
    productos: [],
    subtotal: 0,
    descuentoTotal: 0,
    iva: 0,
    propina: 0,
    total: 0,
};

export function useSaleForm() {
    // ── Catálogos / selects ────────────────────────────────────────────────────
    const [clientesBusqueda, setClientesBusqueda] = useState<Item[]>([]);
    const [productosBusqueda, setProductosBusqueda] = useState<Item[]>([]);

    const [clientesIniciales, setClientesIniciales] = useState<Item[]>([]);
    const [productosIniciales, setProductosIniciales] = useState<Item[]>([]);
    // Array completo de productos iniciales — lookup por id real (NO por índice)
    const [productosData, setProductosData] = useState<ProductosListSelect[]>([]);
    // Mapa id_real → producto para resultados de búsqueda explícita
    const [productosBusquedaData, setProductosBusquedaData] = useState<
        Map<number | string, ProductosListSelect>
    >(new Map());

    const [impuestos, setImpuestos] = useState<ImpuestoSales[]>([]);
    const [tipocomprobante, setTipocomprobante] = useState<TipoComprobante[]>([]);
    const [formadepago, setFormadepago] = useState<FormaPago[]>([]);
    const [last5Sales, setLast5Sales] = useState<SaleList5last[]>([]);

    // ── UI state ───────────────────────────────────────────────────────────────
    const [productosUI, setProductosUI] = useState<ProductoUI[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState<SaveSaleResult | null>(null);
    const [loadingTicket, setLoadingTicket] = useState(false);
    const [loadingA4, setLoadingA4] = useState(false);

    // ── React Hook Form ────────────────────────────────────────────────────────
    const form = useForm<FacturaFormValues>({ defaultValues });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "productos",
    });

    // ── Recalcular totales ─────────────────────────────────────────────────────
    const recalcular = useCallback(() => {
        const current = form.getValues("productos");
        const totales = calcularTotales(current, impuestos);
        form.setValue("subtotal", totales.subtotal);
        form.setValue("descuentoTotal", totales.descuentoTotal);
        form.setValue("iva", totales.iva);
        form.setValue("total", totales.total);
    }, [form, impuestos]);

    const resetForm = useCallback(() => {
        form.reset({ ...defaultValues, fechaEmision: todayString() as any });
        setProductosUI([]);
    }, [form]);

    // ── Carga inicial ──────────────────────────────────────────────────────────
    const loadNewData = useCallback(async () => {
        try {
            const data: NewDataVentas = await saleApi.getNewData();
            console.log(data);
            setImpuestos(data.impuestos ?? []);
            setTipocomprobante(data.vouchertype ?? []);
            setFormadepago(data.formapago ?? []);

            if (data.clientes) {
                setClientesIniciales(
                    data.clientes.map((c) => ({
                        id: c.id as number,
                        name: c.identification
                            ? `${c.name} — ${c.identification}`
                            : c.name,
                    }))
                );
            }

            if (data.productos) {
                // Guardamos el array completo SIN deduplicar
                setProductosData(data.productos);
                // FIX: usar el id REAL del producto, nunca el índice del array.
                // Antes: id: i  → rompía cualquier cruce posterior con búsquedas
                // explícitas, que sí devuelven el id real de la base de datos.
                setProductosIniciales(
                    data.productos.map((p) => ({
                        id: Number(p.id),
                        name: p.name,
                    }))
                );
            }

            // FIX: setValue con String para que coincida con value del <select>
            const normalize = (s: string) =>
                s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const comprobanteVenta = data.vouchertype?.find(
                (t) => normalize(t.name) === "COMPROBANTE DE VENTA"
            );
            const formaPagoDefault = data.formapago?.find(
                (f) => normalize(f.name) === "SIN UTILIZACION DEL SISTEMA FINANCIERO"
            );

            if (comprobanteVenta || formaPagoDefault) {
                form.reset({
                    ...form.getValues(),
                    tipoComprobante: comprobanteVenta ? String(comprobanteVenta.id) : "",
                    formaPago: formaPagoDefault ? String(formaPagoDefault.id) : "",
                });
            }
        } catch (err) {
            console.error("Error cargando datos:", err);
            toast.error("Error al cargar los datos del formulario");
        }
    }, [form]);

    const loadLast5Sales = useCallback(async () => {
        try {
            const sales = await saleApi.listLast5Sales();
            setLast5Sales(sales);
        } catch {
            setLast5Sales([]);
        }
    }, []);

    useEffect(() => {
        loadNewData();
        loadLast5Sales();
    }, [loadNewData, loadLast5Sales]);

    // ── Búsqueda explícita de clientes ────────────────────────────────────────
    const buscarClientesExplicito = useCallback(async (search: string) => {
        if (!search.trim()) return;
        try {
            const result = await clientesApi.find({ search });
            setClientesBusqueda(
                result.map((c) => ({
                    id: c.id as number,
                    name: c.identification
                        ? `${c.name} — ${c.identification}`
                        : c.name,
                }))
            );
        } catch (err) {
            console.error(err);
            toast.error("Error al buscar clientes");
        }
    }, []);

    const seleccionarCliente = useCallback(
        (item: Item | null) => {
            form.setValue("clienteId", item ? item.id : null, {
                shouldValidate: true,
            });
        },
        [form]
    );

    // ── Búsqueda explícita de productos ───────────────────────────────────────
    const buscarProductosExplicito = useCallback(async (search: string) => {
        if (!search.trim()) return;
        try {
            // El endpoint solo devuelve {id, name} — no forzamos ProductosListSelect.
            // El id que llega aquí ES el id real del producto (no un índice).
            const result: Item[] = await productApi.findProductsIdName({ search });

            // Con búsqueda explícita no tenemos price/es_servicio, así que
            // agregarProducto caerá al findOne para obtener el dato completo.
            // Limpiamos el mapa para que no haya datos obsoletos de búsquedas anteriores.
            setProductosBusquedaData(new Map());
            setProductosBusqueda(result);
        } catch (err) {
            console.error(err);
            toast.error("Error al buscar productos");
        }
    }, []);

    // ── Agregar producto ───────────────────────────────────────────────────────
    const agregarProducto = useCallback(
        async (item: Item | null) => {
            if (!item) return;

            // FIX: buscar por id real con .find(), nunca por índice (productosData[item.id]).
            // El id de "item" siempre es el id real del producto (tanto en la carga
            // inicial como en la búsqueda explícita), así que el lookup debe ser
            // siempre por igualdad de id, no por posición en el array.
            let d: ProductosListSelect | undefined = productosData.find(
                (p) => String(p.id) === String(item.id)
            );
            if (!d) d = productosBusquedaData.get(item.id);
            if (!d) {
                try {
                    d = await productApi.findOne({ id: item.id });
                } catch {
                    toast.error("Error al cargar el producto");
                    return;
                }
            }
            if (!d) {
                toast.error("Producto no encontrado");
                return;
            }

            // ── Duplicado: solo subir cantidad ────────────────────────────────────
            const indexExistente = fields.findIndex(
                (f) => f.productoId === d!.id
            );

            if (indexExistente !== -1) {
                const cantidadActual = form.getValues(`productos.${indexExistente}.cantidad`);
                form.setValue(`productos.${indexExistente}.cantidad`, cantidadActual + 1);
                setTimeout(() => recalcular(), 0);
                return; // ← salimos, no hacemos append ni push a productosUI
            }
            // ─────────────────────────────────────────────────────────────────────

            append({
                productoId: d.id,
                es_servicio: d.es_servicio,
                cantidad: 1,
                precioUnitario: d.price,
                descuento: 0,
                codigoImpuesto: String(d.tax_percentage_id),
            });

            setProductosUI((prev) => [
                ...prev,
                { nombre: d!.name, esServicio: d!.es_servicio },
            ]);

            setProductosBusqueda([]);
            setTimeout(() => recalcular(), 0);
        },
        [append, recalcular, productosData, productosBusquedaData, fields, form]
    );

    const eliminarProducto = useCallback(
        (index: number) => {
            remove(index);
            setProductosUI((prev) => prev.filter((_, i) => i !== index));
        },
        [remove]
    );

    // Recalcular cuando cambia cualquier campo de productos
    useEffect(() => {
        const { unsubscribe } = form.watch((_, { name }) => {
            if (name?.startsWith("productos")) recalcular();
        });
        return unsubscribe;
    }, [form, recalcular]);

    // ── Guardar ────────────────────────────────────────────────────────────────
    const guardarFactura = useCallback(async () => {
        const valid = await form.trigger();
        if (!valid) {
            toast.error("Completa los campos requeridos");
            return;
        }

        const values = form.getValues();
        const payload = {
            ...values,
            fechaEmision: formatDateToLocalString(new Date(values.fechaEmision)),
        };

        setSaving(true);
        setSaveResult(null);
        try {
            const response = await saleApi.save(payload);
            const result = parseSaveResponse(response);
            setSaveResult(result);
            if (result.success) {
                resetForm();
                loadNewData();
                loadLast5Sales();
            }
        } catch {
            setSaveResult({
                title: "❌ Error",
                message: "Ocurrió un error al guardar la venta.",
                success: false,
            });
        } finally {
            setSaving(false);
        }
    }, [form, resetForm, loadNewData, loadLast5Sales]);

    // ── PDFs ───────────────────────────────────────────────────────────────────
    const imprimirTicket = useCallback(async (venta: SaleList5last) => {
        setLoadingTicket(true);
        try {
            await saleApi.printTicketPDF({ id: venta.saleId });
        } catch {
            toast.error("Error al imprimir ticket");
        } finally {
            setLoadingTicket(false);
        }
    }, []);

    const imprimirA4 = useCallback(async (venta: SaleList5last) => {
        setLoadingA4(true);
        try {
            await saleApi.printA4PDF({ id: venta.saleId });
        } catch {
            toast.error("Error al imprimir A4");
        } finally {
            setLoadingA4(false);
        }
    }, []);

    return {
        form,
        fields,
        clientes: clientesBusqueda,
        clientesIniciales,
        productosOpciones: productosBusqueda,
        productosIniciales,
        impuestos,
        tipocomprobante,
        formadepago,
        last5Sales,
        productosUI,
        saving,
        saveResult,
        setSaveResult,
        loadingTicket,
        loadingA4,
        buscarClientesExplicito,
        buscarProductosExplicito,
        seleccionarCliente,
        agregarProducto,
        eliminarProducto,
        guardarFactura,
        imprimirTicket,
        imprimirA4,
        recalcular,
    };
}