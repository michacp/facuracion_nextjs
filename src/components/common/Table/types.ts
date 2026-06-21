// src/components/common/Table/types.ts
import type { ReactNode } from "react";

export interface ColHeader {
    label: string;
    align?: "left" | "right" | "center";
}

export interface TableProps {
    // ── Layout ────────────────────────────────────────────────────────────────
    colTemplate: string;
    headers: ColHeader[];

    // ── Estado ────────────────────────────────────────────────────────────────
    loading?: boolean;
    loadingMessage?: string;
    emptyMessage?: string;
    emptyIcon?: ReactNode;        // ícono SVG personalizado para estado vacío

    // ── Contenido ─────────────────────────────────────────────────────────────
    children?: ReactNode;         // filas del feature — undefined = estado vacío

    // ── Paginación ────────────────────────────────────────────────────────────
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number, limit: number) => void;
    pageSizeOptions?: number[];

    // ── Acciones de cabecera (botón crear, exportar, etc.) ────────────────────
    headerActions?: ReactNode;    // slot derecho del header principal
    title?: string;               // título opcional sobre la tabla
}

export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number, limit: number) => void;
    pageSizeOptions?: number[];
}