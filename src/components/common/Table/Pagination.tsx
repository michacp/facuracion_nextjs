// src/components/common/Table/Pagination.tsx
import type { PaginationProps } from "./types";

export const DEFAULT_PAGE_SIZE_OPTIONS = [30, 50, 100, 200];

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const from = totalItems === 0 ? 0 : currentPage * itemsPerPage + 1;
  const to = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-3">
      <span className="text-xs" style={{ color: "var(--su-text-muted)" }}>
        {totalItems > 0 ? `${from}–${to} de ${totalItems}` : "Sin resultados"}
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="su-field-label">Filas:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onPageChange(0, Number(e.target.value))}
            className="su-inset rounded-xl px-2 py-1 text-xs outline-none"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1, itemsPerPage)}
            disabled={currentPage === 0}
            className="su-icon-btn rounded-xl px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >←</button>

          <span
            className="su-inset rounded-xl px-3 py-1.5 text-xs flex items-center"
            style={{ color: "var(--su-text-muted)" }}
          >
            {currentPage + 1} / {Math.max(totalPages, 1)}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1, itemsPerPage)}
            disabled={currentPage >= totalPages - 1}
            className="su-icon-btn rounded-xl px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >→</button>
        </div>
      </div>
    </div>
  );
}