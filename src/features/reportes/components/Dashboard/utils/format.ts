// src/features/reportes/components/Dashboard/utils/format.ts

/**
 * Formatea un número como moneda USD con locale ecuatoriano.
 * Ej: 1250 → "$1,250.00"
 */
export function fmt(value: number): string {
    return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);
}

/**
 * Formatea un número abreviado en miles para etiquetas de gráficos.
 * Ej: 4500 → "$4.5k" | 800 → "$800"
 */
export function fmtK(value: number): string {
    return value >= 1000
        ? `$${(value / 1000).toFixed(1)}k`
        : `$${value}`;
}

/**
 * Formatea un número entero con separador de miles.
 * Ej: 1250 → "1.250"
 */
export function fmtNum(value: number): string {
    return new Intl.NumberFormat("es-EC").format(value);
}