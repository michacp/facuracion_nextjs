// src/features/productos/components/IncomesForm/utils.ts

import type { DetalleRow, IncomesFormState } from "../types/incomesForm.types";

export function redondear(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calcularSubtotalFila(row: DetalleRow): number {
    return redondear(row.cantidad * row.costo_unitario - row.descuento_linea);
}

export function calcularTotales(
    detalles: DetalleRow[],
    descGlobal: number,
    porIva: number,
    envio: number
): Pick<
    IncomesFormState,
    | "compra_subtotal"
    | "compra_valor_impuesto"
    | "compra_total_pagar"
> {
    const subtotalItems = detalles.reduce((acc, d) => acc + d.subtotal_linea, 0);
    const base = redondear(subtotalItems - descGlobal);
    const valorIva = redondear(base * (porIva / 100));
    const total = redondear(base + valorIva + envio);
    return {
        compra_subtotal: subtotalItems,
        compra_valor_impuesto: valorIva,
        compra_total_pagar: total,
    };
}

export function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

export function fmtCurrency(n: number): string {
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(n);
}

// ── NUEVO: helpers de IMEI ──────────────────────────────────────────────

/** true si la fila requiere IMEI y ya tiene la cantidad exacta de IMEIs válidos y únicos */
/** true si la fila requiere IMEI y ya cumple: cantidad=1 y 1-2 IMEIs válidos/únicos */
export function imeisCompletos(row: DetalleRow): boolean {
    if (!row.require_imei) return true;
    if (row.cantidad !== 1) return false; // ítems con IMEI solo permiten 1 unidad por línea

    const validos = row.imeis.map((v) => v.trim()).filter(Boolean);
    const unicos = new Set(validos).size === validos.length;
    return unicos && validos.length >= 1 && validos.length <= 2;
}

/** true si existe alguna fila con IMEIs incompletos (bloquea el submit) */
export function hayImeisPendientes(detalles: DetalleRow[]): boolean {
    return detalles.some((d) => !imeisCompletos(d));
}

export const EMPTY_FORM: IncomesFormState = {
    proveedor_id: null,
    tipo_doc_id: null,
    estado_pago_id: null,
    compra_numero_documento: "",
    compra_fecha_emision: todayISO(),
    compra_subtotal: 0,
    compra_descuento_global: 0,
    compra_porcentaje_impuesto: 0,
    compra_valor_impuesto: 0,
    compra_gastos_envio: 0,
    compra_total_pagar: 0,
    observaciones: "",
    detalles: [],
};