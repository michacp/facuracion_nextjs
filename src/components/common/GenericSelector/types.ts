// src/components/common/GenericSelector/types.ts
import type React from "react";

export interface Item {
    id: number;
    name: string;
}

export interface GenericSelectorProps {
    label?: string;
    placeholder?: string;
    options: Item[];
    /** Ícono SVG opcional — pasa un <svg> como ReactNode */
    icon?: React.ReactNode;
    /** Valor controlado desde fuera (para edición / preselección) */
    value?: Item | null;
    onSelect: (item: Item | null) => void;
    /**
     * Búsqueda asíncrona opcional.
     * Si se provee, se llama al cambiar el texto en lugar de filtrar localmente.
     * Si NO se provee, el filtrado local sigue funcionando igual.
     */
    onSearch?: (search: string) => void | Promise<void>;
    /**
     * Búsqueda explícita — se dispara solo con Enter o clic en lupa.
     * Si se provee junto con onSearch, el onSearch filtra en memoria
     * y onSearchExplicit llama al backend.
     */
    onSearchExplicit?: (search: string) => void | Promise<void>;
    /**
     * Datos base que se muestran al hacer focus antes de cualquier búsqueda.
     * El selector filtra estos en memoria mientras el usuario escribe.
     */
    initialOptions?: Item[];
}