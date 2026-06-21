// src/features/auth/types.ts

/**
 * DTO enviado al backend de NestJS para procesar el inicio de sesión.
 */
export interface LoginDto {
    usernameOrEmail: string;
    password: string;
    rememberMe: boolean;
}

/**
 * Estructura de los datos básicos del usuario que suelen acompañar 
 * a la sesión o venir decodificados en tu arquitectura.
 */
export interface UserPayload {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string; // Esencial para tu control de aislamiento multi-tenant
}

/**
 * Respuesta que devuelve tu endpoint de NestJS tras un login exitoso.
 */
export interface LoginResponse {
    access_token: string;
    user?: UserPayload; // Opcional, por si tu backend además del token retorna la data del usuario
}

/**
 * Estructura exacta del payload decodificado del JWT enviado por NestJS
 */
export interface JwtPayload {
    sub: string;             // ID del usuario
    username: string;        // Nombre de usuario
    email: string;           // Correo electrónico
    empresaId: string | null; // ID de la empresa (Multi-tenant)
    empresaNombre: string | null;
    rol: string | null;       // Rol del usuario en dicha empresa
    planNombre: string | null;
    suscripcionEstado: string | null;
    exp?: number;            // Tiempo de expiración del token (nativo de JWT)
}