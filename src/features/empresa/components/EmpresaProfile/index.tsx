"use client";

import { useState } from "react";
import {
    Building2,
    CreditCard,
    FileSignature,
    MapPin,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
    Users,
} from "lucide-react";
import { empresaApi } from "../../api/empresa.api";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { isAdminRole } from "@/features/auth/utils/roles.utils";
import { useEmpresaProfile } from "../../hooks/useEmpresaProfile";
import { EmpresaEditableField, EmpresaFieldValue, Sucursal, UsuarioEmpresa } from "../../types/empresa.types";
import { estadoBadgeClass, firmaAlertClass, formatDate, formatLimit } from "../../utils/empresa.utils";
import ConfirmDialog from "./ConfirmDialog";
import EditableField from "../EditableField";
import SucursalModal from "./SucursalModal";
import UsuarioModal from "./UsuarioModal";

type ConfirmTarget =
    | { type: "sucursal"; id: number; label: string }
    | { type: "usuario"; id: number; label: string };

export function EmpresaProfile() {
    const currentUser = useCurrentUser();

    const {
        profile,
        loading,
        editingField,
        draftValue,
        saving,
        setDraftValue,
        startEdit,
        cancelEdit,
        saveEdit,
        refetch,
    } = useEmpresaProfile();

    // ── Modales de sucursal y usuario (null = cerrado / crear) ─────────────
    const [sucursalModal, setSucursalModal] = useState<{ open: boolean; data: Sucursal | null }>({
        open: false,
        data: null,
    });
    const [usuarioModal, setUsuarioModal] = useState<{ open: boolean; data: UsuarioEmpresa | null }>({
        open: false,
        data: null,
    });

    // ── Confirmación de borrado (compartida entre sucursal y usuario) ──────
    const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
    const [deleting, setDeleting] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-sm text-su-text-muted">Cargando datos de la empresa…</span>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="su-surface-md rounded-2xl p-6 text-center text-sm text-su-text-muted">
                No se pudo cargar la información de la empresa.
            </div>
        );
    }

    const regimenOptions = profile.regimenes
        .filter((r) => r.id != null && r.name)
        .map((r) => ({ value: r.id as number, label: r.name as string }));

    const regimenLabel =
        profile.regimenes.find((r) => r.id === profile.empresas_regimenes_id)?.name ??
        String(profile.empresas_regimenes_id);

    // ── Permisos: solo ADMINISTRADOR/SUPERADMIN pueden editar/agregar/eliminar ─
    const isAdmin = isAdminRole(currentUser?.rol);

    const field = (name: EmpresaEditableField) => ({
        isEditing: editingField === name,
        saving: editingField === name && saving,
        value: (editingField === name ? draftValue : profile[name]) as EmpresaFieldValue,
        readOnly: !isAdmin,
        onStartEdit: () => startEdit(name),
        onCancel: cancelEdit,
        onSave: saveEdit,
        onChange: setDraftValue,
    });

    // ── Reglas de UI (el backend las vuelve a validar de todas formas) ─────
    const adminCount = profile.usuarios.filter((u) => isAdminRole(u.rol)).length;

    const sucursalBlockReason = (s: Sucursal): string | null => {
        if (s.sucursales_esMatriz) return "No se puede eliminar la sucursal matriz";
        if (profile.sucursales.length <= 1) return "Debe existir al menos una sucursal";
        return null;
    };

    const usuarioBlockReason = (u: UsuarioEmpresa): string | null => {
        if (currentUser && Number(currentUser.sub) === u.usuarios_id) return "No puedes eliminarte a ti mismo";
        if (isAdminRole(u.rol) && adminCount <= 1) return "Debe existir al menos un administrador";
        return null;
    };

    const handleConfirmDelete = async () => {
        if (!confirmTarget) return;
        setDeleting(true);
        try {
            if (confirmTarget.type === "sucursal") {
                await empresaApi.deleteSucursal({ sucursales_id: confirmTarget.id });
            } else {
                await empresaApi.deleteUsuario({ usuario_empresa_id: confirmTarget.id });
            }
            await refetch();
            setConfirmTarget(null);
        } catch {
            // El interceptor global de axios ya muestra el toast de error
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-10">
            {/* ── Datos de la empresa ─────────────────────────────────── */}
            <section className="su-surface-lg rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="su-brand flex h-10 w-10 items-center justify-center rounded-2xl">
                        <Building2 size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-su-text">{profile.empresas_razonSocial}</h2>
                        <p className="text-xs text-su-text-muted">RUC {profile.empresas_ruc}</p>
                    </div>
                </div>

                <div className="su-divider mb-5" />

                <div className="grid gap-5 sm:grid-cols-2">
                    <EditableField label="Razón social" {...field("empresas_razonSocial")} />
                    <EditableField label="Nombre comercial" {...field("empresas_nombreComercial")} />

                    <div className="flex flex-col gap-1.5">
                        <span className="su-field-label">RUC</span>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <ShieldCheck size={14} className="text-su-text-subtle" />
                            {profile.empresas_ruc}
                            <span className="text-[10px] text-su-text-subtle">(no editable)</span>
                        </div>
                    </div>

                    <EditableField label="Dirección matriz" {...field("empresas_dirMatriz")} />
                    <EditableField label="Teléfono" {...field("empresas_telefono")} />
                    <EditableField label="Correo electrónico" {...field("empresa_email")} />

                    <EditableField
                        label="Régimen tributario"
                        type={regimenOptions.length ? "select" : "text"}
                        options={regimenOptions}
                        displayValue={regimenLabel}
                        {...field("empresas_regimenes_id")}
                    />

                    <EditableField
                        label="Obligado a llevar contabilidad"
                        type="boolean"
                        displayValue={profile.empresas_obligadocontabilidad ? "Sí" : "No"}
                        {...field("empresas_obligadocontabilidad")}
                        
                    />

                    <EditableField
                        label="Agente de retención"
                        type="boolean"
                        displayValue={profile.empresas_agenteRetencion ? "Sí" : "No"}
                        {...field("empresas_agenteRetencion")}
                    />
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* ── Suscripción ──────────────────────────────────────── */}
                <section className="su-surface-md rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard size={16} className="text-su-text" />
                        <h3 className="text-sm font-semibold text-su-text">Suscripción</h3>
                        <span
                            className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${estadoBadgeClass(
                                profile.suscripcion.estado
                            )}`}
                        >
                            {profile.suscripcion.estado}
                        </span>
                    </div>
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="su-field-label">Plan</dt>
                            <dd className="text-foreground/90">{profile.suscripcion.plan_nombre}</dd>
                        </div>
                        <div>
                            <dt className="su-field-label">Vence</dt>
                            <dd className="text-foreground/90">{formatDate(profile.suscripcion.fecha_vencimiento)}</dd>
                        </div>
                        <div>
                            <dt className="su-field-label">Usuarios máx.</dt>
                            <dd className="text-foreground/90">
                                {profile.usuarios.length} / {formatLimit(profile.suscripcion.max_usuarios)}
                            </dd>
                        </div>
                        <div>
                            <dt className="su-field-label">Sucursales máx.</dt>
                            <dd className="text-foreground/90">
                                {profile.sucursales.length} / {formatLimit(profile.suscripcion.max_sucursales)}
                            </dd>
                        </div>
                    </dl>
                </section>

                {/* ── Firma electrónica ───────────────────────────────── */}
                <section className="su-surface-md rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileSignature size={16} className="text-su-text" />
                        <h3 className="text-sm font-semibold text-su-text">Firma electrónica</h3>
                    </div>
                    {profile.firma ? (
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div className="col-span-2">
                                <dt className="su-field-label">Archivo</dt>
                                <dd className="text-foreground/90 truncate">{profile.firma.firmas_alias}</dd>
                            </div>
                            <div>
                                <dt className="su-field-label">Expira</dt>
                                <dd className="text-foreground/90">{formatDate(profile.firma.firmas_fechaExpiracion)}</dd>
                            </div>
                            <div>
                                <dt className="su-field-label">Días restantes</dt>
                                <dd>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${firmaAlertClass(
                                            profile.firma.dias_restantes
                                        )}`}
                                    >
                                        {profile.firma.dias_restantes} días
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="text-sm text-su-text-muted">No hay firma electrónica registrada.</p>
                    )}
                </section>

                {/* ── Sucursales ───────────────────────────────────────── */}
                <section className="su-surface-md rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-su-text" />
                        <h3 className="text-sm font-semibold text-su-text flex-1">
                            Sucursales <span className="text-su-text-muted">({profile.sucursales.length})</span>
                        </h3>
                        {/* BOTÓN AGREGAR SUCURSAL: Condicionado a isAdmin */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setSucursalModal({ open: true, data: null })}
                                className="su-icon-btn"
                                aria-label="Agregar sucursal"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>
                    {profile.sucursales.length === 0 ? (
                        <p className="text-sm text-su-text-muted">No hay sucursales registradas.</p>
                    ) : (
                        <ul className="flex flex-col gap-2.5">
                            {profile.sucursales.map((s) => {
                                const blockReason = sucursalBlockReason(s);
                                return (
                                    <li
                                        key={s.sucursales_id}
                                        className="su-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground/90 truncate">
                                                {s.sucursales_nombre}
                                                {s.sucursales_esMatriz && (
                                                    <span className="ml-2 rounded-full bg-brand-indigo/10 px-2 py-0.5 text-[10px] font-semibold text-brand-indigo">
                                                        MATRIZ
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-su-text-muted truncate">{s.sucursales_direccion}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-su-text-subtle">Cód. {s.sucursales_cod}</span>
                                            {/* ACCIONES SUCURSAL: Solo visibles si es administrador */}
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSucursalModal({ open: true, data: s })}
                                                        className="su-icon-btn"
                                                        aria-label="Editar sucursal"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={!!blockReason}
                                                        title={blockReason ?? "Eliminar sucursal"}
                                                        onClick={() =>
                                                            setConfirmTarget({
                                                                type: "sucursal",
                                                                id: s.sucursales_id,
                                                                label: s.sucursales_nombre,
                                                            })
                                                        }
                                                        className="su-icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
                                                        aria-label="Eliminar sucursal"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* ── Usuarios ─────────────────────────────────────────── */}
                <section className="su-surface-md rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-su-text" />
                        <h3 className="text-sm font-semibold text-su-text flex-1">
                            Usuarios <span className="text-su-text-muted">({profile.usuarios.length})</span>
                        </h3>
                        {/* BOTÓN AGREGAR USUARIO: Condicionado a isAdmin */}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setUsuarioModal({ open: true, data: null })}
                                className="su-icon-btn"
                                aria-label="Agregar usuario"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>
                    {profile.usuarios.length === 0 ? (
                        <p className="text-sm text-su-text-muted">No hay usuarios registrados.</p>
                    ) : (
                        <ul className="flex flex-col gap-2.5">
                            {profile.usuarios.map((u) => {
                                const blockReason = usuarioBlockReason(u);
                                return (
                                    <li
                                        key={u.usuario_empresa_id}
                                        className="su-inset flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground/90 truncate">
                                                {u.nombre}
                                                {currentUser && Number(currentUser.sub) === u.usuarios_id && (
                                                    <span className="ml-2 rounded-full bg-brand-indigo/10 px-2 py-0.5 text-[10px] font-semibold text-brand-indigo">
                                                        ERES TÚ
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-su-text-muted truncate">{u.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-[10px] font-semibold text-brand-purple">
                                                {u.rol}
                                            </span>
                                            <span
                                                className={`h-2 w-2 rounded-full ${u.activo ? "bg-emerald-500" : "bg-gray-400"}`}
                                                title={u.activo ? "Activo" : "Inactivo"}
                                            />
                                            {/* ACCIONES USUARIO: Solo visibles si es administrador */}
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setUsuarioModal({ open: true, data: u })}
                                                        className="su-icon-btn"
                                                        aria-label="Editar usuario"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={!!blockReason}
                                                        title={blockReason ?? "Eliminar usuario"}
                                                        onClick={() =>
                                                            setConfirmTarget({
                                                                type: "usuario",
                                                                id: u.usuario_empresa_id,
                                                                label: u.nombre,
                                                            })
                                                        }
                                                        className="su-icon-btn disabled:opacity-40 disabled:cursor-not-allowed"
                                                        aria-label="Eliminar usuario"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            <SucursalModal
                isOpen={sucursalModal.open}
                sucursal={sucursalModal.data}
                onClose={() => setSucursalModal({ open: false, data: null })}
                onSaved={refetch}
            />

            <UsuarioModal
                isOpen={usuarioModal.open}
                usuario={usuarioModal.data}
                onClose={() => setUsuarioModal({ open: false, data: null })}
                onSaved={refetch}
            />

            <ConfirmDialog
                isOpen={!!confirmTarget}
                title={confirmTarget?.type === "sucursal" ? "Eliminar sucursal" : "Eliminar usuario"}
                description={
                    confirmTarget
                        ? `¿Seguro que quieres eliminar "${confirmTarget.label}"? Esta acción no se puede deshacer.`
                        : ""
                }
                loading={deleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmTarget(null)}
            />
        </div>
    );
}