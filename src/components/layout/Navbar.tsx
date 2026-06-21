"use client";
// src/components/layout/Navbar.tsx

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, User, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Cookies from "js-cookie";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { JwtPayload } from "@/features/auth/types/auth.types";
import Link from 'next/link';
export interface NavbarProps {
  /** Un solo handler para el botón hamburguesa.
   *  El Navbar no sabe si es móvil o desktop — solo dispara el evento.
   *  El layout padre decide qué hacer con `toggleOpen` vs `toggleCollapse`
   *  pasando el handler correcto aquí según el breakpoint, o bien
   *  se usa el enfoque unificado: un único `onMenuToggle` que el layout
   *  resuelve internamente (ver comentario en el layout). */
  onMenuToggle: () => void;
  isSidebarCollapsed: boolean;
  user: JwtPayload | null;
}

// ─── Hook logout ──────────────────────────────────────────────────────────────

function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      Cookies.remove("token");
      router.refresh();
      router.push("/login");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { handleLogout, loading };
}

// ─── UserDropdown ─────────────────────────────────────────────────────────────

function UserDropdown({ user }: { user: JwtPayload | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { handleLogout, loading } = useLogout();
  const initials = user?.username?.charAt(0)?.toUpperCase() ?? "?";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className={[
          "flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-su-bg border border-su-border transition-all duration-150",
          open ? "shadow-su-inset-press" : "shadow-su-sm hover:shadow-su-md",
        ].join(" ")}
      >
        <div className="su-avatar su-brand w-7 h-7 rounded-xl">
          <span className="text-[11px] font-bold text-white">{initials}</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-su-bg" />
        </div>

        <div className="hidden md:flex flex-col leading-none text-left min-w-0">
          <span className="text-[13px] font-semibold text-su-text truncate max-w-[110px]">
            {user?.username ?? "Cargando..."}
          </span>
          <span className="text-[11px] text-su-text-muted capitalize mt-0.5 truncate">
            {user?.rol?.toLowerCase() ?? "usuario"}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-su-text-subtle hidden md:block transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel — su-dropdown (globals) */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-64 z-50 su-dropdown">

          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="su-avatar su-brand w-11 h-11 rounded-2xl">
                <span className="text-base font-bold text-white">{initials}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-su-bg" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-su-text truncate">{user?.username ?? "—"}</span>
                <span className="text-xs text-su-text-muted truncate">{user?.email ?? "—"}</span>
              </div>
            </div>

            {user?.planNombre && (
              <div className="flex items-center gap-2 mt-3.5">
                <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-xl su-inset text-su-text">
                  {user.planNombre}
                </span>
                {user.suscripcionEstado && (
                  <span className={[
                    "inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-xl su-inset",
                    user.suscripcionEstado === "ACTIVA"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400",
                  ].join(" ")}>
                    {user.suscripcionEstado}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mx-5 su-divider" />

          <div className="p-3 flex flex-col gap-1">
<Link 
  href="/miperfil" 
  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-su-text-muted hover:text-su-text hover:bg-su-bg-deep transition-all duration-150 group"
>
  <User className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-150" />
  Mi perfil
</Link> 

            <div className="mx-1 my-0.5 su-divider" />

            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              disabled={loading}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-red-500/70 dark:text-red-400/70 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all duration-150 disabled:opacity-50 group"
            >
              <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-150" />
              {loading ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar({ onMenuToggle, isSidebarCollapsed, user }: NavbarProps) {
  return (
    <header className="
      sticky top-0 z-30 shrink-0
      flex items-center justify-between h-16 px-4 sm:px-6
      bg-su-bg border-b border-su-border
      backdrop-blur-xl
      [box-shadow:0_4px_20px_rgba(102,16,242,0.07)] dark:[box-shadow:0_4px_20px_rgba(0,0,0,0.4)]
      transition-colors duration-200
    ">

      {/* Izquierda — botón hamburguesa unificado.
          Clases completamente estáticas para que Tailwind las detecte en el scanner.
          CSS puro decide qué ícono se ve → mismo HTML en servidor y cliente. */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menú"
          className="su-icon-btn"
        >
          {/* Móvil (<lg): siempre hamburguesa — la X vive dentro de la Sidebar */}
          <Menu className="w-[18px] h-[18px] lg:hidden" />

          {/* Desktop (≥lg) colapsado: mostrar PanelLeftOpen */}
          {isSidebarCollapsed
            ? <PanelLeftOpen  className="w-[18px] h-[18px] hidden lg:block" />
            : <PanelLeftClose className="w-[18px] h-[18px] hidden lg:block" />
          }
        </button>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2.5">

        <div className="relative">
          <button aria-label="Notificaciones" className="su-icon-btn">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full su-brand ring-2 ring-su-bg pointer-events-none" />
        </div>

        <ThemeToggle />

        <div className="w-px h-7 bg-gradient-to-b from-transparent via-su-border-strong to-transparent mx-1" />

        <UserDropdown user={user} />
      </div>
    </header>
  );
}