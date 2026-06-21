/**
 * Mapa de jerarquía de roles administrativos.
 * A mayor número, mayor nivel de privilegios.
 * Los roles operativos que no están aquí implícitamente tienen rango 0.
 */
export const ROLES_RANK: Record<string, number> = {
    ADMINISTRADOR: 1,
    SUPERADMIN: 2,
    // Si en el futuro agregas un SUPERVISOR entre ambos:
    // SUPERVISOR: 1.5,
};

/**
 * Obtiene el peso numérico de un rol.
 */
export function getRoleRank(rol: string | null | undefined): number {
    if (!rol) return 0;
    return ROLES_RANK[rol.toUpperCase()] ?? 0;
}

/**
 * Verifica si el usuario tiene al menos el rango de ADMINISTRADOR (Rango >= 1).
 * Esto es lo que consume directamente tu componente EmpresaProfile.
 */
export function isAdminRole(rol: string | null | undefined): boolean {
    const userRank = getRoleRank(rol);
    const adminRequiredRank = ROLES_RANK.ADMINISTRADOR; // 1

    return userRank >= adminRequiredRank;
}

/**
 * Verifica si un usuario tiene permisos suficientes comparándolo con un rol mínimo requerido.
 * Útil para cualquier otra sección del sistema en el futuro.
 * * @example hasRequiredRole(currentUser.rol, "ADMINISTRADOR")
 */
export function hasRequiredRole(userRole: string | null | undefined, requiredRole: string): boolean {
    const userRank = getRoleRank(userRole);
    const requiredRank = getRoleRank(requiredRole);

    return userRank >= requiredRank;
}