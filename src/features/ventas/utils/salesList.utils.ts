// src/features/ventas/components/SalesList/utils.ts

export function fmtCurrency(n: number): string {
    return new Intl.NumberFormat("es-EC", {
        style: "currency", currency: "USD", minimumFractionDigits: 2,
    }).format(n);
}

export function fmtDateTime(iso: string): string {
    return new Intl.DateTimeFormat("es-EC", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
}