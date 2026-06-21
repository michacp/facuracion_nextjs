// src/features/empresa/types/empresa.types.ts

export interface Suscripcion {
    plan_nombre: string;
    estado: string;
    fecha_vencimiento: string;
    max_usuarios: number;
    max_sucursales: number;
}

export interface Sucursal {
    sucursales_id: number;
    sucursales_cod: string;
    sucursales_nombre: string;
    sucursales_direccion: string;
    sucursales_telefono: string;
    sucursales_esMatriz: boolean;
}

export interface UsuarioEmpresa {
    usuario_empresa_id: number;
    usuarios_id: number;
    username: string;
    nombre: string;
    email: string;
    rol: string;
    cod_emisor: string;
    activo: boolean;
}

export interface Firma {
    firmas_id: number;
    firmas_alias: string;
    firmas_fechaEmision: string;
    firmas_fechaExpiracion: string;
    firmas_activa: boolean;
    dias_restantes: number;
}

/** Forma flexible: ajusta cuando se confirme el catálogo real de regímenes */
export interface Regimen {
    id?: number;
    name?: string;
}

export interface EmpresaProfile {
    empresas_id: number;
    empresas_razonSocial: string;
    empresas_nombreComercial: string;
    empresas_ruc: string;
    empresas_dirMatriz: string;
    empresas_telefono: string;
    empresa_email: string;
    empresas_obligadocontabilidad: boolean;
    empresas_agenteRetencion: boolean;
    empresas_regimenes_id: number;
    suscripcion: Suscripcion;
    sucursales: Sucursal[];
    usuarios: UsuarioEmpresa[];
    firma: Firma | null;
    regimenes: Regimen[];
}

/** Campos editables vía /empresa/update (el RUC queda excluido a propósito) */
export type EmpresaUpdatePayload = Pick<
    EmpresaProfile,
    | "empresas_razonSocial"
    | "empresas_nombreComercial"
    | "empresas_dirMatriz"
    | "empresas_telefono"
    | "empresa_email"
    | "empresas_obligadocontabilidad"
    | "empresas_agenteRetencion"
    | "empresas_regimenes_id"
>;

export type EmpresaEditableField = keyof EmpresaUpdatePayload;

export type EmpresaFieldValue = string | number | boolean;

// ── Catálogos ────────────────────────────────────────────────────────────

export interface Rol {
    id: number;
    name: string;
}

// ── Sucursales (POST /empresa/sucursal/save y /sucursal/delete) ───────────

export interface SaveSucursalPayload {
    /** undefined = crear, número = editar */
    sucursales_id?: number;
    sucursales_cod: string;
    sucursales_nombre: string;
    sucursales_direccion: string;
    sucursales_telefono?: string;
    sucursales_esMatriz?: boolean;
}

export interface DeleteSucursalPayload {
    sucursales_id: number;
}

// ── Usuarios (POST /empresa/usuario/save y /usuario/delete) ───────────────

export interface SaveUsuarioPayload {
    /** undefined = crear usuario nuevo, número = editar vínculo existente */
    usuario_empresa_id?: number;
    username: string;
    nombre: string;
    email: string;
    /** Requerido solo si es nuevo usuario */
    password?: string;
    rol_id: number;
    cod_emisor: string;
}

export interface DeleteUsuarioPayload {
    usuario_empresa_id: number;
}