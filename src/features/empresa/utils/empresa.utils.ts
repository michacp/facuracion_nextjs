// src/features/empresa/utils/empresa.utils.ts

export function formatDate(value: string | null | undefined): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("es-EC", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

/** -1 en max_usuarios / max_sucursales significa sin límite (plan OWNED, etc.) */
export function formatLimit(max: number): string {
    return max === -1 ? "Sin límite" : String(max);
}

/** Clases de color según el estado de la suscripción */
export function estadoBadgeClass(estado: string): string {
    const normalized = estado?.toUpperCase() ?? "";
    if (normalized === "ACTIVA") return "text-emerald-600 bg-emerald-600/10";
    if (normalized === "VENCIDA" || normalized === "SUSPENDIDA") return "text-red-600 bg-red-600/10";
    return "text-amber-600 bg-amber-600/10";
}

/** Clases de color según los días restantes de la firma electrónica */
export function firmaAlertClass(diasRestantes: number): string {
    if (diasRestantes <= 7) return "text-red-600 bg-red-600/10";
    if (diasRestantes <= 30) return "text-amber-600 bg-amber-600/10";
    return "text-emerald-600 bg-emerald-600/10";
}