// 📄 Ubicación: src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🔄 El único cambio de código es renombrar la función a 'proxy'
export function proxy(request: NextRequest) {
    // 🍪 Intentamos leer la cookie del token
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // 🎯 CASO 1: Si ya está logueado e intenta ir al login, lo mandamos al Dashboard
    if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 🔒 CASO 2: Si NO está logueado y quiere entrar a una ruta protegida
    if (!token && pathname !== "/login" && pathname !== "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Si todo está en orden, permitimos que continúe la navegación normal
    return NextResponse.next();
}

/**
 * 🛠️ Filtro del Proxy
 * Toda la configuración del matcher se queda exactamente igual.
 */
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest).*)",
    ],
};