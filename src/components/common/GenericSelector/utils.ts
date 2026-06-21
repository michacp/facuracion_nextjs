import type { Item } from "./types";

export function filterOptions(options: Item[], text: string): Item[] {
    const q = text.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(q));
}