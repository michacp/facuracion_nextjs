// src/features/reportes/utils/reportes.utils.ts
import { EstadoPago } from "../types/reportes.types";

export function fmtCurrency(n: number): string {
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(n);
}

export function fmtDate(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-EC", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

export const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function fmtMes(mes: number, anio: number): string {
    return `${MESES[(mes - 1) % 12]} ${anio}`;
}

/** Clases de color según el estado de pago */
export function estadoPagoBadge(estado: EstadoPago): string {
    switch (estado) {
        case "PAGADO": return "text-emerald-600 bg-emerald-600/10";
        case "PARCIAL": return "text-amber-600 bg-amber-600/10";
        case "PENDIENTE": return "text-red-600 bg-red-600/10";
        default: return "text-su-text-muted bg-su-bg-deep";
    }
}

/** Clases de color según la antigüedad en días */
export function antiguedadClass(dias: number): string {
    if (dias > 60) return "text-red-600";
    if (dias > 30) return "text-amber-600";
    return "text-foreground/80";
}