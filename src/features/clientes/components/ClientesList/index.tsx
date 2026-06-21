"use client";

import { useState } from "react";
import { Table, Row, Cell, DEFAULT_PAGE_SIZE_OPTIONS } from "@/components/common/Table";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { ColHeader } from "@/components/common/Table";
import { useClientesList } from "../../hooks/useClientesList";
import { clientesApi } from "../../api/clientes.api";
import { ClienteListItem } from "../../types/clientes.types";
import { NewCustomerModal } from "../NewCustomerModal";
import { EditCustomerModal } from "../EditCustomerModal";

// ── Columnas ──────────────────────────────────────────────────────────────────
const COL_TEMPLATE = "1fr 160px 1fr 120px 1fr 52px";

const HEADERS: ColHeader[] = [
    { label: "Nombre / Razón social" },
    { label: "Identificación" },
    { label: "Correo" },
    { label: "Teléfono" },
    { label: "Dirección" },
    { label: "", align: "center" },
];

// ── Ícono vacío ───────────────────────────────────────────────────────────────
function ClienteEmptyIcon() {
    return (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1}
            style={{ color: "var(--su-text-subtle)" }}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

// ── Fila ──────────────────────────────────────────────────────────────────────
interface ClienteRowProps {
    cliente: ClienteListItem;
    onEdit: (c: ClienteListItem) => void;
    onDelete: (c: ClienteListItem) => void;
}

function ClienteRow({ cliente, onEdit, onDelete }: ClienteRowProps) {
    return (
        <Row colTemplate={COL_TEMPLATE} py="py-2.5">
            <Cell main={cliente.razon_social} />
            <Cell main={cliente.identificacion} sub={cliente.tipo_identificacion} font="mono" />
            <Cell main={cliente.email ?? "—"} />
            <Cell main={cliente.telefono ?? "—"} />
            <Cell main={cliente.direccion ?? "—"} />

            <div className="flex justify-center items-center gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(cliente)}
                    className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
                    title="Editar cliente"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(cliente)}
                    className="su-icon-btn w-8 h-8 rounded-xl flex items-center justify-center"
                    title="Eliminar cliente"
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
export function ClientesList() {
    const { clientes, total, loading, search, page, limit,
        handleSearchChange, handlePageChange, refetch } = useClientesList();

    const [newModalOpen, setNewModalOpen]     = useState(false);
    const [editingCliente, setEditingCliente] = useState<ClienteListItem | null>(null);
    const [deletingCliente, setDeletingCliente] = useState<ClienteListItem | null>(null);
    const [deleting, setDeleting]             = useState(false);

    const handleConfirmDelete = async () => {
        if (!deletingCliente) return;
        setDeleting(true);
        try {
            await clientesApi.delete({ id: deletingCliente.id });
            await refetch();
            setDeletingCliente(null);
        } catch {
            // El interceptor global de axios ya muestra el toast de error
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 px-4 py-6 max-w-[1400px] mx-auto">

            {/* ── Encabezado ───────────────────────────────────────────── */}
            <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                    Clientes
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
                    Gestión del directorio de clientes
                </p>
            </div>

            {/* ── Filtros ───────────────────────────────────────────────── */}
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
                            placeholder="Nombre, RUC o cédula…"
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
                        Nuevo cliente
                    </button>
                </div>
            </div>

            {/* ── Tabla ────────────────────────────────────────────────── */}
            <Table
                title="Listado de Clientes"
                colTemplate={COL_TEMPLATE}
                headers={HEADERS}
                loading={loading}
                loadingMessage="Cargando clientes…"
                emptyMessage="No se encontraron clientes"
                emptyIcon={<ClienteEmptyIcon />}
                currentPage={page}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
            >
                {clientes.map((c) => (
                    <ClienteRow
                        key={c.id}
                        cliente={c}
                        onEdit={setEditingCliente}
                        onDelete={setDeletingCliente}
                    />
                ))}
            </Table>

            {/* ── Modales ───────────────────────────────────────────────── */}
            {newModalOpen && (
                <NewCustomerModal
                    onSuccess={() => refetch()}
                    onClose={() => setNewModalOpen(false)}
                />
            )}

            {editingCliente && (
                <EditCustomerModal
                    cliente={editingCliente}
                    onSuccess={() => { refetch(); setEditingCliente(null); }}
                    onClose={() => setEditingCliente(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!deletingCliente}
                title="Eliminar cliente"
                description={
                    deletingCliente
                        ? `¿Seguro que quieres eliminar a "${deletingCliente.razon_social}"? Esta acción no se puede deshacer.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingCliente(null)}
            />
        </div>
    );
}