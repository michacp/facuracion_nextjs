// src/features/ventas/components/InvoiceList/utils/format.ts

/**
 * Devuelve las clases CSS del chip según el estado de la factura.
 * Equivale a getEstadoColor() del componente Angular.
 */
export function getEstadoStyles(estado: string): { border: string; bg: string; color: string } {
    const map: Record<string, { border: string; bg: string; color: string }> = {
        AUTORIZADO: { border: "rgba(34,197,94,0.4)", bg: "rgba(34,197,94,0.08)", color: "#16a34a" },
        "NO AUTORIZADO": { border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.08)", color: "#dc2626" },
        DEVUELTA: { border: "rgba(249,115,22,0.4)", bg: "rgba(249,115,22,0.08)", color: "#ea580c" },
        PENDIENTE: { border: "rgba(234,179,8,0.4)", bg: "rgba(234,179,8,0.08)", color: "#ca8a04" },
        ANULADO: { border: "rgba(148,163,184,0.4)", bg: "rgba(148,163,184,0.08)", color: "#64748b" },
    };
    return map[estado] ?? { border: "var(--su-border)", bg: "var(--su-bg-deep)", color: "var(--su-text-muted)" };
}

/**
 * Devuelve estilos del chip de ambiente.
 * 2 = PRODUCCIÓN (verde) | cualquier otro = PRUEBAS (amarillo)
 */
export function getAmbienteStyles(ambiente: number): { border: string; bg: string; color: string; label: string } {
    if (ambiente === 2) {
        return { border: "rgba(34,197,94,0.4)", bg: "rgba(34,197,94,0.08)", color: "#16a34a", label: "PROD" };
    }
    return { border: "rgba(234,179,8,0.4)", bg: "rgba(234,179,8,0.08)", color: "#ca8a04", label: "PRUEBAS" };
}

/**
 * Formatea fecha ISO a dd/MM/yyyy
 */
export function fmtFecha(iso: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Formatea hora de autorización a HH:mm
 */
export function fmtHora(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Formatea moneda USD
 */
export function fmt(value: number): string {
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
}

/**
 * Trunca un texto a N caracteres con ellipsis
 */
export function truncate(text: string, max = 40): string {
    return text.length > max ? `${text.slice(0, max)}…` : text;
}