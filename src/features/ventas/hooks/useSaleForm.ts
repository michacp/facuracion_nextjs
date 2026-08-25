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
import { imeiSaleApi } from "../api/imei.api";

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

// Convierte un producto completo (ProductosListSelect) al Item que consume el selector.
// FIX: lote_id (productos) e item_id (servicios) son contadores independientes en la
// base de datos, así que pueden coincidir numéricamente entre un producto y un servicio.
// Para que cada Item.id sea único en la lista combinada (y React no choque con keys
// duplicadas), los servicios se mapean a un id NEGATIVO. El id real nunca es 0, así que
// no hay forma de que un id positivo (producto) choque con uno negativo (servicio).
function toItem(p: ProductosListSelect): Item {
    const realId = Number(p.id);
    return {
        id: p.es_servicio ? -realId : realId,
        name: p.name,
        imeis: p.imeis,
        requireImei: p.require_imei,
    };
}

export function useSaleForm() {
    // ── Catálogos / selects ────────────────────────────────────────────────────
    const [clientesBusqueda, setClientesBusqueda] = useState<Item[]>([]);
    const [productosBusqueda, setProductosBusqueda] = useState<Item[]>([]);

    const [clientesIniciales, setClientesIniciales] = useState<Item[]>([]);
    const [productosIniciales, setProductosIniciales] = useState<Item[]>([]);

    // Único almacén de productos completos, indexado por id real (lote_id o item_id
    // según es_servicio). Se llena tanto en la carga inicial como en cada búsqueda
    // explícita — siempre con el objeto completo, nunca solo {id, name}.
    const [productosMap, setProductosMap] = useState<Map<number, ProductosListSelect>>(
        new Map()
    );

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

    // Guarda un lote de productos en el mapa central (merge, no reemplazo total).
    // FIX: usa la misma clave con signo que toItem (negativo para servicios) para
    // que nunca haya colisión entre el lote_id de un producto y el item_id de un
    // servicio que numéricamente coincidan.
    const guardarProductosEnMapa = useCallback((productos: ProductosListSelect[]) => {
        setProductosMap((prev) => {
            const next = new Map(prev);
            for (const p of productos) {
                const realId = Number(p.id);
                const key = p.es_servicio ? -realId : realId;
                next.set(key, p);
            }
            return next;
        });
    }, []);

    // ── Carga inicial: dos endpoints en paralelo ────────────────────────────────
    const loadNewData = useCallback(async () => {
        try {
            const [data, productos]: [NewDataVentas, ProductosListSelect[]] =
                await Promise.all([
                    saleApi.getNewData(), // ya NO trae productos
                    productApi.findProductsIdName({ search: "" }), // últimos 50/lista inicial
                ]);

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

            guardarProductosEnMapa(productos);
            setProductosIniciales(productos.map(toItem));

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
    }, [form, guardarProductosEnMapa]);

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
    // findProductsIdName devuelve el objeto COMPLETO (id, name, price, stock,
    // tax_percentage_id, es_servicio) — lo guardamos en el mapa central y nunca
    // necesitamos volver a pedirlo al seleccionar.
    const buscarProductosExplicito = useCallback(
        async (search: string) => {
            if (!search.trim()) return;
            try {
                const result: ProductosListSelect[] = await productApi.findProductsIdName({
                    search,
                });
                guardarProductosEnMapa(result);
                setProductosBusqueda(result.map(toItem));
            } catch (err) {
                console.error(err);
                toast.error("Error al buscar productos");
            }
        },
        [guardarProductosEnMapa]
    );

    // ── Agregar producto ───────────────────────────────────────────────────────
    const agregarProducto = useCallback(
        async (item: Item | null) => {
            if (!item) return;

            const d = productosMap.get(item.id as number);
            if (!d) {
                toast.error("Producto no encontrado");
                return;
            }

            // ── Duplicado ────────────────────────────────────────────────────────
            const indexExistente = fields.findIndex((f) => f.productoId === d.id);
            if (indexExistente !== -1) {
                if (d.require_imei) {
                    toast.info("Este celular ya está en la venta — no se puede vender 2 veces el mismo lote");
                    return;
                }
                const cantidadActual = form.getValues(`productos.${indexExistente}.cantidad`);
                form.setValue(`productos.${indexExistente}.cantidad`, cantidadActual + 1);
                setTimeout(() => recalcular(), 0);
                return;
            }

            // ── Si requiere IMEI, traer los IMEIs disponibles del lote ────────────
            let imeiIds: number[] | undefined;
            let imeisDisplay: string[] | undefined;

            if (!d.es_servicio && d.require_imei) {
                try {
                    const res = await imeiSaleApi.findDisponiblesByLote(Number(d.id));
                    if (res.imeis.length === 0) {
                        toast.error("Este lote no tiene IMEIs disponibles para vender");
                        return;
                    }
                    imeiIds = res.imeis.map((i) => i.imei_id);
                    imeisDisplay = res.imeis.map((i) => i.imei);
                } catch (err) {
                    console.error("Error obteniendo IMEIs del lote:", err);
                    toast.error("Error al obtener los IMEIs de este producto");
                    return;
                }
            }

            append({
                productoId: d.id,
                es_servicio: d.es_servicio,
                cantidad: 1,
                precioUnitario: d.price,
                descuento: 0,
                codigoImpuesto: String(d.tax_percentage_id),
                imei_ids: imeiIds,
            });

            setProductosUI((prev) => [
                ...prev,
                {
                    nombre: d.name,
                    esServicio: d.es_servicio,
                    requireImei: d.require_imei,
                    imeisDisplay,
                },
            ]);

            setProductosBusqueda([]);
            setTimeout(() => recalcular(), 0);
        },
        [append, recalcular, productosMap, fields, form]
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
            tipoComprobante: Number(values.tipoComprobante),
            formaPago: Number(values.formaPago),
            clienteId: Number(values.clienteId),
            fechaEmision: formatDateToLocalString(new Date(values.fechaEmision)),
            // FIX: codigoImpuesto y productoId se guardan como string en el estado
            // del formulario (por el <select> y por consistencia interna), pero el
            // backend espera number (@IsInt() @IsPositive()) — se convierten aquí,
            // justo antes de enviar, sin tocar cómo vive el dato en el formulario.
            productos: values.productos.map((p) => ({
                ...p,
                productoId: Number(p.productoId),
                codigoImpuesto: Number(p.codigoImpuesto),
            })),
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