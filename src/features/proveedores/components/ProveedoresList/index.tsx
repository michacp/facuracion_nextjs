"use client";
// src/features/proveedores/components/ProveedoresList/index.tsx

import { useState } from "react";
import { Table, Row, Cell, DEFAULT_PAGE_SIZE_OPTIONS } from "@/components/common/Table";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { ColHeader } from "@/components/common/Table";
import { useProveedoresList } from "../../hooks/useProveedoresList";
import { proveedorListApi } from "../../api/proveedor-list.api";
import { ProveedorListItem } from "../../types/proveedor-list.types";
import { ProveedorModal } from "../ProveedorModal";
import { NewProveedorModal } from "../NewProveedorModal";

// ── Columnas ──────────────────────────────────────────────────────────────────
// razón social (1fr) | identificación (160px) | país (100px) | contacto (1fr) | compras (80px) | acciones (72px)
const COL_TEMPLATE = "1fr 160px 100px 1fr 80px 72px";

const HEADERS: ColHeader[] = [
    { label: "Comercial / Razón social" },
    { label: "Identificación" },
    { label: "País" },
    { label: "Contacto" },
    { label: "Compras", align: "right" },
    { label: "", align: "center" },
];

// ── Ícono vacío ───────────────────────────────────────────────────────────────
function ProveedorEmptyIcon() {
    return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1}
            style={{ color: "var(--su-text-subtle)" }}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
    );
}

// ── Fila ──────────────────────────────────────────────────────────────────────
interface ProveedorRowProps {
    proveedor: ProveedorListItem;
    onView: (p: ProveedorListItem) => void;
    onDelete: (p: ProveedorListItem) => void;
}

function ProveedorRow({ proveedor, onView, onDelete }: ProveedorRowProps) {
    return (
        <Row colTemplate={COL_TEMPLATE} py="py-2.5">

            <Cell
                main={proveedor.nombre_comercial || proveedor.razon_social}
                sub={proveedor.nombre_comercial !== proveedor.razon_social
                    ? proveedor.razon_social
                    : undefined}
            />

            <Cell
                main={proveedor.identificacion}
                sub={proveedor.tipo_identificacion_nombre}
                font="mono"
            />

            <Cell main={proveedor.pais} />

            <Cell
                main={proveedor.email || "—"}
                sub={proveedor.telefono || undefined}
            />

            <Cell
                align="right"
                main={
                    <span style={{ color: proveedor.total_compras === 0 ? "var(--su-text-muted)" : "var(--foreground)" }}>
                        {proveedor.total_compras}
                    </span>
                }
            />

            {/* Acciones */}
            <div className="flex justify-center items-center gap-1">
                {/* Ver / Editar */}
                <button
                    type="button"
                    onClick={() => onView(proveedor)}
                    className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
                    title="Ver / Editar proveedor"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                    </svg>
                </button>

                {/* Eliminar */}
                <button
                    type="button"
                    onClick={() => onDelete(proveedor)}
                    className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
                    title="Eliminar proveedor"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </Row>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ProveedoresList() {
    const {
        proveedores, total, loading,
        search, page, limit,
        handleSearchChange, handlePageChange, refetch,
    } = useProveedoresList();

    const [newModalOpen, setNewModalOpen] = useState(false);
    const [viewingId, setViewingId] = useState<number | null>(null);
    const [deletingProveedor, setDeletingProveedor] = useState<ProveedorListItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!deletingProveedor) return;
        setDeleting(true);
        try {
            await proveedorListApi.delete({ proveedor_id: deletingProveedor.proveedor_id });
            await refetch();
            setDeletingProveedor(null);
        } catch {
            // El interceptor global de axios ya muestra el toast de error
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

            {/* ── Filtros ───────────────────────────────────────────── */}
            <div className="flex items-end gap-3 flex-wrap">

                <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
                    <label className="su-field-label pl-1">Buscar</label>
                    <div className="su-inset rounded-2xl flex items-center gap-2 px-3"
                        style={{ border: "1px solid var(--su-border)" }}>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2}
                            style={{ color: "var(--su-text-muted)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Nombre, RUC o razón social…"
                            className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
                            style={{ color: "var(--foreground)" }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <span className="su-field-label pl-1 invisible">x</span>
                    <button
                        type="button"
                        onClick={() => setNewModalOpen(true)}
                        className="su-brand flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-semibold"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo proveedor
                    </button>
                </div>
            </div>

            {/* ── Tabla ─────────────────────────────────────────────── */}
            <Table
                title="Listado de Proveedores"
                colTemplate={COL_TEMPLATE}
                headers={HEADERS}
                loading={loading}
                loadingMessage="Cargando proveedores…"
                emptyMessage="No se encontraron proveedores"
                emptyIcon={<ProveedorEmptyIcon />}
                currentPage={page}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
            >
                {proveedores.map((p) => (
                    <ProveedorRow
                        key={p.proveedor_id}
                        proveedor={p}
                        onView={(prov) => setViewingId(prov.proveedor_id)}
                        onDelete={setDeletingProveedor}
                    />
                ))}
            </Table>

            {/* ── Modales ───────────────────────────────────────────── */}
            {newModalOpen && (
                <NewProveedorModal
                    onClose={(result) => {
                        setNewModalOpen(false);
                        if (result) refetch();
                    }}
                />
            )}

            {viewingId !== null && (
                <ProveedorModal
                    proveedorId={viewingId}
                    onClose={() => setViewingId(null)}
                    onSaved={refetch}
                />
            )}

            <ConfirmDialog
                isOpen={!!deletingProveedor}
                title="Eliminar proveedor"
                description={
                    deletingProveedor
                        ? `¿Seguro que quieres eliminar a "${deletingProveedor.razon_social}"? Esta acción no se puede deshacer.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingProveedor(null)}
            />
        </div>
    );
}