// src/features/productos/components/IncomesList/utils.ts

import type { CompraItem } from "../types/incomesList.types";

export function getSaldoPendiente(c: CompraItem): number {
    return Math.max(0, c.total_pagar - c.total_pagado);
}

// Tokens de color por estado — alineados a los CSS vars del proyecto
export function getEstadoStyle(estado: string): { background: string; color: string } {
    const map: Record<string, { background: string; color: string }> = {
        PAGADO: { background: "#bbf7d0", color: "#14532d" },
        PARCIAL: { background: "#fed7aa", color: "#7c2d12" },
        PENDIENTE: { background: "#fef08a", color: "#713f12" },
    };
    return map[estado] ?? { background: "var(--su-bg-deep)", color: "var(--su-text-muted)" };
}

export function fmtCurrency(n: number): string {
    return new Intl.NumberFormat("es-EC", {
        style: "currency", currency: "USD", minimumFractionDigits: 2,
    }).format(n);
}

export function fmtDate(iso: string): string {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
}

export const PAGE_SIZE_OPTIONS = [30, 50, 100];