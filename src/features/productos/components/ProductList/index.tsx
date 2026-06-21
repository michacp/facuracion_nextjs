// src/features/productos/components/ProductList/index.tsx
"use client";

import { useState } from "react";
import { useProductList } from "../../hooks/useProductList";
import { EditProductModal } from "./EditProductModal";
import { Table, Row, Cell } from "@/components/common/Table";
import type { ColHeader } from "@/components/common/Table";
import type { ProductoListItem } from "../../types/product-list.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

// ── Columnas ──────────────────────────────────────────────────────────────────

const COL_TEMPLATE = "100px 1fr 88px 60px 90px 80px 110px 100px 120px 52px";

const HEADERS: ColHeader[] = [
  { label: "Código" },
  { label: "Nombre" },
  { label: "Precio",         align: "right" },
  { label: "Stock",          align: "right" },
  { label: "Tipo" },
  { label: "Impuesto" },
  { label: "Tipo Impuesto" },
  { label: "Marcas" },
  { label: "Modelos" },
  { label: "",               align: "center" },
];

// ── Fila ──────────────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit }: {
  product: ProductoListItem;
  onEdit: (id: number) => void;
}) {
  return (
    <Row colTemplate={COL_TEMPLATE} py="py-2.5">

      <Cell font="mono" main={product.codigo} />

      <Cell main={product.nombre} />

      <Cell align="right" main={fmtCurrency(product.precio)} />

      {/* Stock — el feature decide el color según lógica de negocio */}
      <Cell
        align="right"
        main={
          <span style={{ color: product.stock === 0 ? "#dc2626" : "var(--foreground)" }}>
            {product.stock}
          </span>
        }
      />

      <Cell main={product.tipo_nombre} />

      <Cell main={product.impuesto_nombre} />

      <Cell main={product.impuesto_tipo_nombre} />

      <Cell main={product.marcas} />

      <Cell main={product.modelos} />

      {/* Acción — botón directo, no pasa por Cell */}
      <div className="flex justify-center">
        <button
          onClick={() => onEdit(product.id)}
          className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
          title="Editar producto" aria-label="Editar producto"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
          </svg>
        </button>
      </div>

    </Row>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  onRowClick?: (id: number) => void;
}

export function ProductList({ onRowClick }: Props) {
  const {
    products, categories, totalItems,
    searchText, setSearchText,
    selectedCategory,
    currentPage, itemsPerPage,
    loading,
    onKeyup, onSearchEnter, onCategoryChange, onPageChange,
    reload,
  } = useProductList();

  const [editingId, setEditingId] = useState<number | null>(null);

  function handleEdit(id: number) {
    if (onRowClick) onRowClick(id);
    else setEditingId(id);
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

      {/* ── Encabezado ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
          Productos
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
          Catálogo de productos y control de inventario
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex items-end gap-3 flex-wrap">

        <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Buscar</label>
          <div className="su-inset rounded-2xl flex items-center gap-2 px-3"
            style={{ border: "1px solid var(--su-border)" }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyUp={onKeyup}
              onKeyDown={(e) => e.key === "Enter" && onSearchEnter()}
              placeholder="Nombre o código…"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
              style={{ color: "var(--foreground)" }}
            />
            <button type="button" onClick={onSearchEnter}
              className="su-icon-btn w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              tabIndex={-1} aria-label="Buscar">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="w-48 flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Categoría</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="su-inset rounded-2xl px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--foreground)", background: "var(--su-bg)" }}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tabla ── */}
      <Table
        title="Listado de Productos"
        colTemplate={COL_TEMPLATE}
        headers={HEADERS}
        loading={loading}
        loadingMessage="Cargando productos…"
        emptyMessage="No se encontraron productos"
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
      >
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onEdit={handleEdit} />
        ))}
      </Table>

      {/* ── Modal ── */}
      {editingId !== null && (
        <EditProductModal
          productId={editingId}
          onClose={(saved) => {
            setEditingId(null);
            if (saved) reload();
          }}
        />
      )}
    </div>
  );
}