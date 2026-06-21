# Contexto del proyecto — Frontend Next.js (SaaS de inventario/facturación)

> Pega este archivo al inicio de cualquier hilo nuevo para darle contexto completo al asistente.

---

## Stack técnico

- **Framework:** Next.js (App Router) con TypeScript
- **Estilos:** Tailwind CSS v4 + sistema de diseño propio (`su-*`)
- **HTTP:** Axios con interceptores (token + toasts de error)
- **Auth:** Cookies via `js-cookie` + JWT desde NestJS
- **Toast:** Sonner
- **Estado global:** Zustand (`authStore.ts`)
- **Backend:** NestJS (separado, corre en `https://localhost:3950`)

---

## Arquitectura de carpetas

```
src/
├── app/                          # Solo rutas — cero lógica de negocio
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Monta <LoginForm />
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + Navbar + contexto Tenant
│   │   ├── dashboard/
│   │   │   └── page.tsx          # ← Monta <Dashboard />   ✅ IMPLEMENTADO
│   │   ├── owner/                # Superadmin (pendiente)
│   │   ├── sucursales/           # pendiente
│   │   ├── inventario/           # pendiente
│   │   ├── clientes/             # pendiente
│   │   └── ventas/nueva/         # pendiente
│   ├── layout.tsx                # Layout raíz
│   └── globals.css               # Tokens CSS del sistema de diseño
│
├── components/
│   ├── ui/                       # Shadcn: button, table, modal...
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DataTable.tsx
│   │   ├── RoleGuard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ThemeToggle.tsx       # Botón flotante dark/light
│   └── layout/
│
├── features/                     # Módulos de negocio (patrón Angular/Nest)
│   ├── auth/                     # ✅ IMPLEMENTADO
│   │   ├── api/auth.api.ts
│   │   ├── components/LoginForm.tsx
│   │   ├── components/LogoutButton.tsx
│   │   ├── hooks/useLogin.ts
│   │   └── types.ts
│   │
│   ├── reportes/                 # ✅ IMPLEMENTADO (módulo dashboard)
│   │   ├── types.ts
│   │   ├── api/reportes.api.ts
│   │   ├── hooks/useDashboard.ts
│   │   └── components/Dashboard.tsx
│   │
│   ├── sucursales/               # pendiente
│   ├── inventario/               # pendiente
│   ├── clientes/                 # pendiente
│   └── ventas/                   # pendiente
│       ├── api/ventas.api.ts
│       ├── components/pos/
│       ├── components/invoice/
│       ├── hooks/
│       └── store/cartStore.ts
│
├── hooks/                        # Hooks globales reutilizables
│   ├── useAuth.ts
│   ├── useTenant.ts
│   ├── useDebounce.ts
│   └── usePermissions.ts
│
├── lib/
│   ├── axios.ts                  # ✅ Instancia central con interceptores
│   ├── utils.ts
│   ├── constants.ts
│   └── validators.ts
│
├── types/
│   ├── index.ts
│   ├── api.ts
│   └── models.ts
│
├── stores/
│   └── authStore.ts
│
└── middleware.ts                 # Protección de rutas por cookie
```

---

## Regla de arquitectura (importante)

Los `page.tsx` son **solo enrutadores** — montan un componente de `features/` y nada más:

```tsx
// src/app/(dashboard)/dashboard/page.tsx
import { Dashboard } from "@/features/reportes/components/Dashboard";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <Dashboard />
    </main>
  );
}
```

Toda la lógica, estado y llamadas HTTP viven en `features/<modulo>/`.

---

## Sistema de diseño (`globals.css`)

Tema neomórfico con tokens CSS propios. Variables principales:

```css
/* Colores de marca */
--brand-indigo:      #6610f2;
--brand-purple:      #6f42c1;

/* Superficies */
--su-bg:             #f0eefb;  /* dark: #160d2e */
--su-bg-deep:        #e8e5f7;  /* dark: #110a24 */

/* Texto */
--su-text:           #6610f2;  /* dark: #d8b4fe */
--su-text-muted:     rgba(102,16,242,0.45);
--su-text-subtle:    rgba(102,16,242,0.30);

/* Bordes */
--su-border:         rgba(102,16,242,0.08);
--su-border-strong:  rgba(102,16,242,0.18);

/* Sombras neomórficas */
--su-shadow-sm / --su-shadow-md / --su-shadow-lg
--su-shadow-brand / --su-shadow-brand-lg
--su-shadow-inset / --su-shadow-inset-focus / --su-shadow-inset-press
```

### Clases utilitarias del tema

| Clase | Uso |
|---|---|
| `su-surface` | Superficie pequeña (navbar buttons, badges) |
| `su-surface-md` | Superficie media (sidebar, cards, tablas) |
| `su-surface-lg` | Superficie grande (login card, modales) |
| `su-inset` | Elemento hundido (inputs, checkboxes) |
| `su-brand` | Acento de marca (botón submit, nav activo) — gradiente indigo→purple |
| `su-icon-btn` | Botón de ícono con hover neomórfico |
| `su-divider` | Divisor con gradiente |
| `su-avatar` | Base de avatar |
| `su-avatar-shine` | Brillo decorativo del avatar |
| `su-dropdown` | Panel dropdown con animación |
| `su-field-label` | Label de formulario (10px, uppercase, tracking) |

**Dark mode:** automático via clase `.dark` en el `<html>`. Todos los tokens se redefinen dentro de `.dark {}`.

---

## HTTP — `src/lib/axios.ts`

```typescript
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:3950",
  headers: { "Content-Type": "application/json" },
});

// Request: adjunta JWT desde cookie
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? Cookies.get("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: toasts automáticos de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const msg = Array.isArray(error.response.data?.message)
        ? error.response.data.message[0]
        : error.response.data?.message || "Ocurrió un error en el servidor.";
      const status = error.response.status;
      if (status === 401) toast.error("Acceso denegado", { description: msg });
      else if (status === 400) toast.warning("Datos inválidos", { description: msg });
      else toast.error(`Error (${status})`, { description: msg });
    } else {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor.",
      });
    }
    return Promise.reject(error);
  }
);
```

**Nota crítica:** el token se guarda en cookie (`Cookies.set("token", ...)`) en `useLogin.ts`, y se lee con `Cookies.get("token")` en el interceptor. No usar `localStorage` para el token.

---

## Auth — `src/features/auth/`

### `hooks/useLogin.ts` (fragmento clave)

```typescript
// Guarda el token en cookie al hacer login exitoso
Cookies.set("token", response.access_token, {
  expires: rememberMe ? 7 : undefined,
  secure: true,
  sameSite: "strict",
});
```

### `api/auth.api.ts`

```typescript
import { api } from "@/lib/axios";

export const authApi = {
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    return data;
  },
};
```

---

## Dashboard — `src/features/reportes/`

### Endpoints del backend

| Endpoint | Descripción |
|---|---|
| `GET /reportes/kpis` | KPIs por semana / mes / año |
| `GET /reportes/ventas-semanas` | Ventas agrupadas por semana (para gráfico) |
| `GET /reportes/stock-bajo` | Productos bajo umbral de stock |
| `GET /reportes/alertas` | Firmas por vencer, facturas SRI pendientes, compras por pagar |
| `GET /reportes/top-productos?periodo=mes` | Top productos más vendidos |
| `GET /reportes/top-clientes?periodo=mes` | Top clientes por facturación |

`periodo` acepta: `semana` | `mes` | `anio`

### Patrón del módulo

```
reportes/
├── types.ts              # Interfaces de todos los endpoints
├── api/reportes.api.ts   # Capa HTTP — llama a api (axios)
├── hooks/useDashboard.ts # Estado — Promise.allSettled en paralelo
└── components/Dashboard.tsx  # UI — consume el hook
```

### `hooks/useDashboard.ts` — comportamiento

- Lanza las 6 peticiones **en paralelo** con `Promise.allSettled`
- Si `/reportes/kpis` falla → error global
- Si cualquier otro endpoint falla → fallback vacío (el resto del panel sigue funcionando)
- `periodoTop` es reactivo: cambiar entre semana/mes/año re-ejecuta `getTopProductos` y `getTopClientes`

---

## Patrón para nuevos módulos

Seguir siempre esta estructura al crear un módulo nuevo (ej. `sucursales`):

```
src/
├── app/(dashboard)/sucursales/
│   └── page.tsx                  # Solo: import + return <Sucursales />
└── features/sucursales/
    ├── types.ts                   # Interfaces del backend
    ├── api/sucursales.api.ts      # Peticiones HTTP con `api` de axios
    ├── hooks/useSucursales.ts     # Estado, loading, error, fetch
    └── components/Sucursales.tsx  # UI completa
```

---

## Notas para el asistente

1. **Importar `api`** siempre desde `@/lib/axios` — nunca crear una instancia nueva de axios.
2. **El token** vive en `Cookies` (js-cookie), no en `localStorage`.
3. **Los `page.tsx`** no tienen lógica — solo montan componentes de `features/`.
4. **El sistema de diseño** usa clases `su-*` y variables CSS `--su-*` / `--brand-*`. No usar clases de Tailwind para colores de marca, usar las variables directamente en `style={{}}`.
5. **Dark mode** es automático — todos los tokens ya cambian solos con la clase `.dark`.
6. **Gráficos de barras:** calcular altura en `px` absolutos en JS, no con `%` relativo al contenedor flex.
