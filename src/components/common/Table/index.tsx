// src/components/common/Table/index.tsx
"use client";

import type { ReactNode } from "react";
import { Pagination } from "./Pagination";
import type { TableProps } from "./types";

// ── Tokens internos — NO se exportan, solo el genérico los usa ───────────────

const BORDER    = "var(--su-divider)";
const ROW_BASE  = "grid items-center gap-3 px-4 border-b border-[var(--su-divider)] last:border-b-0 transition-colors duration-100 hover:bg-[var(--su-bg-deep)]";

// ── Ícono vacío por defecto ───────────────────────────────────────────────────

function DefaultEmptyIcon() {
  return (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1}
      style={{ color: "var(--su-text-subtle)" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  );
}

// ── Estado: cargando ──────────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center gap-3">
      <div className="w-5 h-5 rounded-full border-2 animate-spin"
        style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
      <span className="text-sm" style={{ color: "var(--su-text-muted)" }}>{message}</span>
    </div>
  );
}

// ── Estado: sin datos ─────────────────────────────────────────────────────────

function EmptyState({ message, icon }: { message: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      {icon}
      <p className="text-sm" style={{ color: "var(--su-text-muted)" }}>{message}</p>
    </div>
  );
}

// ── Cabecera de columnas ──────────────────────────────────────────────────────

function ColHeaders({ colTemplate, headers }: Pick<TableProps, "colTemplate" | "headers">) {
  return (
    <div
      className="grid items-center gap-3 px-4 py-2 border-b border-[var(--su-divider)]"
      style={{
        gridTemplateColumns: colTemplate,
        background: "var(--su-bg-deep)",
      }}
    >
      {headers.map(({ label, align }, i) => (
        <span key={i}
          className="su-field-label text-[11px] uppercase tracking-wider select-none"
          style={{ textAlign: align ?? "left" }}>
          {label}
        </span>
      ))}
    </div>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────

function TopBar({ title, actions }: { title?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {title && (
        <h1 className="text-xl font-bold" style={{ color: "var(--su-text)" }}>
          {title}
        </h1>
      )}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Row — wrapper que el feature usa para cada fila ───────────────────────────
// El feature solo decide colTemplate y py-* (densidad de contenido).
// Todo lo demás (borde, hover, gap, px) lo controla el genérico.

interface RowProps {
  colTemplate: string;
  py?: string;          // "py-2" | "py-2.5" | "py-3" — default "py-2.5"
  children: ReactNode;
}

export function Row({ colTemplate, py = "py-2.5", children }: RowProps) {
  return (
    <div
      className={`${ROW_BASE} ${py}`}
      style={{ gridTemplateColumns: colTemplate }}
    >
      {children}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function Table({
  colTemplate, headers,
  loading = false,
  loadingMessage = "Cargando…",
  emptyMessage = "No se encontraron registros",
  emptyIcon,
  children,
  currentPage, totalItems, itemsPerPage, onPageChange, pageSizeOptions,
  title, headerActions,
}: TableProps) {

  const showTopBar = title || headerActions;

  if (loading) return (
    <div className="flex flex-col gap-3">
      {showTopBar && <TopBar title={title} actions={headerActions} />}
      <LoadingState message={loadingMessage} />
    </div>
  );

  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  if (isEmpty) return (
    <div className="flex flex-col gap-3">
      {showTopBar && <TopBar title={title} actions={headerActions} />}
      <EmptyState message={emptyMessage} icon={emptyIcon ?? <DefaultEmptyIcon />} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {showTopBar && <TopBar title={title} actions={headerActions} />}

      <div className="su-surface-md rounded-2xl overflow-hidden border border-[var(--su-divider)]">

        <ColHeaders colTemplate={colTemplate} headers={headers} />

        {children}

        <div className="border-t border-[var(--su-divider)]">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            pageSizeOptions={pageSizeOptions}
          />
        </div>
      </div>
    </div>
  );
}

// ── Re-exports ────────────────────────────────────────────────────────────────
export { Pagination }          from "./Pagination";
export { DEFAULT_PAGE_SIZE_OPTIONS } from "./Pagination";
export { Cell }                from "./Cell";
export type { TableProps, ColHeader, PaginationProps } from "./types";