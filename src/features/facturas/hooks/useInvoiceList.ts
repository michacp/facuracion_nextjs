// src/features/facturas/hooks/useInvoiceList.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { invoiceApi } from "../api/invoice.api";
import { EstadoItem, FacturaItem } from "../types/invoice.types";

const PAGE_SIZE_DEFAULT = 30;

export function useInvoiceList() {
    // ── Filtros ───────────────────────────────────────────────────────────────
    const [searchText, setSearchText] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("");
    // Fechas como Date | null — compatible con react-datepicker
    const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
    const [fechaHasta, setFechaHasta] = useState<Date | null>(null);

    // ── Paginación ────────────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE_DEFAULT);
    const [totalItems, setTotalItems] = useState(0);

    // ── Datos ─────────────────────────────────────────────────────────────────
    const [facturas, setFacturas] = useState<FacturaItem[]>([]);
    const [estados, setEstados] = useState<EstadoItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Loading por fila ──────────────────────────────────────────────────────
    const [syncingId, setSyncingId] = useState<number | null>(null);
    const [printingId, setPrintingId] = useState<number | null>(null);
    const [printingA4Id, setPrintingA4Id] = useState<number | null>(null);
    const [retryingId, setRetryingId] = useState<number | null>(null);

    const previousSearch = useRef("");

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchFacturas = useCallback(async (page = currentPage, limit = itemsPerPage) => {
        setIsLoading(true);
        try {
            const res = await invoiceApi.listFacturas({
                search: searchText || undefined,
                estado: selectedEstado || undefined,
                // Convertimos Date → string ISO "yyyy-MM-dd" para el backend
                fechaDesde: fechaDesde ? fechaDesde.toISOString().split("T")[0] : undefined,
                fechaHasta: fechaHasta ? fechaHasta.toISOString().split("T")[0] : undefined,
                page,
                limit,
            });
            setFacturas(res.facturas);
            setTotalItems(res.total);
            setEstados(res.estados);
        } finally {
            setIsLoading(false);
        }
    }, [searchText, selectedEstado, fechaDesde, fechaHasta, currentPage, itemsPerPage]);

    // Carga inicial
    useEffect(() => { fetchFacturas(0, PAGE_SIZE_DEFAULT); }, []); // eslint-disable-line

    // ── Handlers ──────────────────────────────────────────────────────────────

    const onSearchKeyup = () => {
        const current = searchText.trim();
        if (!current && previousSearch.current) {
            previousSearch.current = "";
            fetchFacturas(0, itemsPerPage);
        }
        if (current) previousSearch.current = current;
    };

    const applyFilters = () => {
        setCurrentPage(0);
        fetchFacturas(0, itemsPerPage);
    };

    const onPageChange = (page: number, limit: number) => {
        setCurrentPage(page);
        setItemsPerPage(limit);
        fetchFacturas(page, limit);
    };

    /** Handler para el DateRangePicker — recibe [Date|null, Date|null] */
    /** Handler para el DateRangePicker — recibe [Date|null, Date|null] */
    const onRangeChange = (start: Date | null, end: Date | null) => {
        setFechaDesde(start);
        setFechaHasta(end);

        // Si el usuario seleccionó ambas fechas completas, o si LIMPIÓ el campo (ambas null)
        if ((start && end) || (!start && !end)) {
            setCurrentPage(0);

            // Ejecutamos la búsqueda usando directamente los nuevos parámetros "start" y "end"
            // para saltarnos el retraso del estado asíncrono de React
            setIsLoading(true);
            invoiceApi.listFacturas({
                search: searchText || undefined,
                estado: selectedEstado || undefined,
                fechaDesde: start ? start.toISOString().split("T")[0] : undefined,
                fechaHasta: end ? end.toISOString().split("T")[0] : undefined,
                page: 0,
                limit: itemsPerPage,
            })
                .then((res) => {
                    setFacturas(res.facturas);
                    setTotalItems(res.total);
                    setEstados(res.estados);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    // ── Actualización optimista de fila ───────────────────────────────────────

    const updateFila = (factura_id: number, patch: Partial<FacturaItem>) => {
        setFacturas((prev) =>
            prev.map((f) => (f.factura_id === factura_id ? { ...f, ...patch } : f))
        );
    };

    // ── Acciones por fila ─────────────────────────────────────────────────────

    const onSync = async (factura: FacturaItem) => {
        setSyncingId(factura.factura_id);
        try {
            const res = await invoiceApi.syncFactura({ factura_id: factura.factura_id });
            if (res.cambio) {
                updateFila(factura.factura_id, {
                    estado: res.estadoNuevo,
                    fecha_autorizacion: res.fechaAutorizacion,
                    tiene_xml: factura.tiene_xml || res.xmlActualizado,
                });
            }
        } finally { setSyncingId(null); }
    };

    const onRetry = async (factura: FacturaItem) => {
        setRetryingId(factura.factura_id);
        try {
            const res = await invoiceApi.retryFactura({ factura_id: factura.factura_id });
            updateFila(factura.factura_id, {
                estado: res.estado,
                fecha_autorizacion: res.fechaAutorizacion,
            });
        } finally { setRetryingId(null); }
    };

    const onPrintTicket = async (factura: FacturaItem) => {
        setPrintingId(factura.factura_id);
        try { await invoiceApi.printTicketPDF({ id: factura.venta_id }); }
        finally { setPrintingId(null); }
    };

    const onPrintA4 = async (factura: FacturaItem) => {
        setPrintingA4Id(factura.factura_id);
        try { await invoiceApi.printA4PDF({ id: factura.venta_id }); }
        finally { setPrintingA4Id(null); }
    };

    return {
        // Filtros
        searchText, setSearchText,
        selectedEstado, setSelectedEstado,
        fechaDesde, fechaHasta, onRangeChange,
        onSearchKeyup, applyFilters,
        // Paginación
        currentPage, totalItems, itemsPerPage, onPageChange,
        // Datos
        facturas, estados, isLoading,
        // Loading por fila
        syncingId, printingId, printingA4Id, retryingId,
        // Acciones
        onSync, onRetry, onPrintTicket, onPrintA4,
    };
}