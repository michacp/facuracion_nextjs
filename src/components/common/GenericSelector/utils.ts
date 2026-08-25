import type { Item } from "./types";

/**
 * Filtra opciones en memoria.
 *
 * - Si el texto empieza con "#": se interpreta como búsqueda por un campo
 *   especial (IMEI), NO por nombre. Se compara contra item.imeis en vez de
 *   item.name. Esto es específico de items que traen imeis (productos) —
 *   para cualquier otro uso genérico del selector (clientes, etc.) donde
 *   los items no tienen imeis, simplemente no habrá match local y se
 *   depende de la búsqueda explícita al backend (Enter / lupa).
 * - Si el texto es solo "#" (sin nada después): no filtra nada, muestra
 *   todas las opciones — así el usuario ve que entró en "modo IMEI" sin
 *   que la lista se vacíe de golpe.
 * - Si no empieza con "#": comportamiento normal, filtra por item.name.
 */
export function filterOptions(options: Item[], text: string): Item[] {
    const trimmed = text.trim();

    if (trimmed.startsWith("#")) {
        const q = trimmed.slice(1).toLowerCase();
        if (!q) return options;
        return options.filter((o) =>
            o.imeis?.some((imei) => imei.toLowerCase().includes(q))
        );
    }

    const q = trimmed.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(q));
}