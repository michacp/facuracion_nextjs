// src/features/empresa/types/miPerfil.types.ts

export interface MiPerfil {
    usuarios_id: number;
    username: string;
    nombre: string;
    email: string;
    activo: boolean;
    rol: string;
    cod_emisor: string;
    empresa_nombre: string;
}

/** Campos editables vía /empresa/mi-perfil/update */
export type MiPerfilUpdatePayload = Pick<MiPerfil, "nombre" | "email">;

export type MiPerfilEditableField = keyof MiPerfilUpdatePayload;

export interface ChangePasswordPayload {
    passwordActual: string;
    passwordNuevo: string;
}