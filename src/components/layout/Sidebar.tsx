"use client";
// src/components/layout/Sidebar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Boxes, Shield, X,
  ChevronDown, Plus, List, Package, Users, Truck, // ◄ Agregado: Truck
  Receipt, PenLine
} from "lucide-react";
import { JwtPayload } from "@/features/auth/types/auth.types";

export interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  user: JwtPayload | null;
}

// ─── NavLink simple ───────────────────────────────────────────────────────────

function NavLink({ href, icon: Icon, label, isCollapsed, pathname, onClick }: {
  href: string; icon: React.ElementType; label: string;
  isCollapsed: boolean; pathname: string; onClick: () => void;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group relative flex items-center gap-3.5 rounded-2xl text-sm font-medium transition-all duration-200",
        isCollapsed ? "justify-center p-3" : "px-4 py-3",
        isActive
          ? "su-brand"
          : "su-surface text-su-text-muted hover:shadow-su-md hover:text-su-text",
      ].join(" ")}
    >
      <Icon className={[
        "shrink-0 transition-all duration-200",
        isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
        isActive
          ? "text-white drop-shadow-sm"
          : "text-su-text-subtle group-hover:text-su-text group-hover:scale-110",
      ].join(" ")} />

      {/* Tooltip modo colapsado */}
      {isCollapsed && (
        <span className="
          absolute left-full ml-4 px-3 py-1.5 rounded-xl text-xs font-semibold
          su-brand whitespace-nowrap pointer-events-none z-50
          opacity-0 translate-x-1
          group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-150
        ">
          {label}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-brand-indigo" />
        </span>
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 whitespace-nowrap">{label}</span>
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />}
        </>
      )}
    </Link>
  );
}

// ─── SubLink ──────────────────────────────────────────────────────────────────

function SubLink({ href, icon: Icon, label, pathname, onClick }: {
  href: string; icon: React.ElementType; label: string;
  pathname: string; onClick: () => void;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 pl-3 pr-3 py-2 rounded-xl text-xs font-medium transition-all duration-150",
        isActive
          ? "su-brand"
          : "text-su-text-muted hover:text-su-text hover:bg-su-bg-deep",
      ].join(" ")}
    >
      <Icon className={[
        "w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110",
        isActive ? "text-white" : "text-su-text-subtle",
      ].join(" ")} />
      <span className="whitespace-nowrap">{label}</span>
      {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-white/70" />}
    </Link>
  );
}

// SubLink para la sidebar expandida (con indentación)
function SubLinkIndented({ href, icon: Icon, label, pathname, onClick }: {
  href: string; icon: React.ElementType; label: string;
  pathname: string; onClick: () => void;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 pl-10 pr-4 py-2 rounded-xl text-xs font-medium transition-all duration-150",
        isActive
          ? "su-brand"
          : "text-su-text-muted hover:text-su-text hover:bg-su-bg-deep",
      ].join(" ")}
    >
      <Icon className={[
        "w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110",
        isActive ? "text-white" : "text-su-text-subtle",
      ].join(" ")} />
      <span className="whitespace-nowrap">{label}</span>
      {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-white/70" />}
    </Link>
  );
}

// ─── NavAccordion ─────────────────────────────────────────────────────────────

function NavAccordion({ icon: Icon, label, isCollapsed, children, flyoutChildren, matchPrefix, pathname }: {
  icon: React.ElementType; label: string; isCollapsed: boolean;
  children: React.ReactNode;       // subitems con indentación (sidebar expandida)
  flyoutChildren: React.ReactNode; // subitems sin indentación (flyout colapsado)
  matchPrefix: string; pathname: string;
}) {
  const isAnyChildActive = pathname.startsWith(matchPrefix);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAnyChildActive) setOpen(true);
  }, [isAnyChildActive]);

  // ── MODO COLAPSADO: ícono + flyout al hover ───────────────────────────────
  if (isCollapsed) {
    return (
      <div className="group relative flex justify-center">

        {/* Botón ícono */}
        <button className={[
          "flex items-center justify-center p-3 rounded-2xl transition-all duration-200",
          isAnyChildActive
            ? "su-brand"
            : "su-surface text-su-text-muted hover:shadow-su-md hover:text-su-text",
        ].join(" ")}>
          <Icon className={[
            "w-5 h-5 shrink-0",
            isAnyChildActive ? "text-white" : "text-su-text-subtle",
          ].join(" ")} />
        </button>

        {/* Puente invisible — cubre el gap de ml-3 entre el botón y el flyout
            sin él, el hover se pierde al cruzar ese espacio y el panel se cierra */}
        <div className="absolute left-full top-0 h-full w-3 z-50" />

        {/* Flyout — visible al hover sobre el grupo */}
        <div className="
          absolute left-full top-0 ml-3 z-50
          w-48 rounded-2xl overflow-hidden
          bg-su-bg border border-su-border shadow-su-lg
          opacity-0 pointer-events-none translate-x-2
          group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-x-0
          transition-all duration-150
        ">
          {/* Título del grupo */}
          <div className="px-4 py-2.5 border-b border-su-border">
            <span className="su-field-label">{label}</span>
          </div>
          {/* Subitems */}
          <div className="p-1.5 flex flex-col gap-0.5">
            {flyoutChildren}
          </div>
        </div>

      </div>
    );
  }

  // ── MODO EXPANDIDO: trigger + hijos con animación ─────────────────────────
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          "w-full group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200",
          isAnyChildActive
            ? "su-surface shadow-su-md text-su-text"
            : "su-surface text-su-text-muted hover:shadow-su-md hover:text-su-text",
        ].join(" ")}
      >
        <Icon className={[
          "w-[18px] h-[18px] shrink-0 transition-all duration-200",
          isAnyChildActive
            ? "text-su-text"
            : "text-su-text-subtle group-hover:text-su-text group-hover:scale-110",
        ].join(" ")} />
        <span className="flex-1 text-left whitespace-nowrap">{label}</span>
        <ChevronDown className={[
          "w-3.5 h-3.5 shrink-0 text-su-text-subtle transition-transform duration-200",
          open ? "rotate-180" : "",
        ].join(" ")} />
      </button>

      <div className={[
        "overflow-hidden transition-all duration-200",
        open ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0",
      ].join(" ")}>
        <div className="flex flex-col gap-0.5 pb-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ isOpen, isCollapsed, onClose, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-brand-indigo/20 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside className={[
        "fixed inset-y-0 left-0 z-50 flex flex-col",
        "lg:static lg:translate-x-0",
        "bg-su-bg border-r border-su-border",
        "[box-shadow:6px_0_24px_rgba(102,16,242,0.07)] dark:[box-shadow:6px_0_24px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-[76px] overflow-visible" : "w-64 overflow-hidden",
      ].join(" ")}>

        {/* ── Header ── */}
        <div className={[
          "flex items-center h-16 shrink-0 px-4 gap-3",
          isCollapsed ? "justify-center" : "justify-between",
        ].join(" ")}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="su-avatar su-brand w-9 h-9 rounded-2xl shrink-0">
              <span className="text-white font-bold text-sm">S</span>
              <div className="su-avatar-shine" />
            </div>
            <div className={[
              "flex flex-col leading-none overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "opacity-100 flex-1",
            ].join(" ")}>
              <span className="font-bold text-su-text text-base whitespace-nowrap tracking-tight">Enterprise</span>
              <span className="text-[10px] text-su-text-subtle uppercase tracking-[0.15em] whitespace-nowrap">Admin Suite</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className={["su-icon-btn lg:!hidden shrink-0", isCollapsed ? "invisible" : ""].join(" ")}
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="mx-4 su-divider" />

        {/* ── Empresa suscrita ── */}
        {!isCollapsed && user?.empresaNombre && (
          <Link
            href="/empresa"
            onClick={onClose}
            className="mx-4 my-2.5 py-1.5 flex items-center gap-3 min-w-0 select-none rounded-xl hover:bg-su-bg-deep group/empresa transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-xl bg-su-bg-deep border border-su-border flex items-center justify-center text-[11px] font-bold text-su-text-muted shrink-0 shadow-sm group-hover/empresa:border-su-border-strong transition-colors">
              {user.empresaNombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-su-text truncate leading-tight tracking-tight group-hover/empresa:text-su-brand-text transition-colors">
                {user.empresaNombre}
              </span>
              <span className="text-[10px] text-su-text-subtle font-medium mt-0.5 capitalize">
                {user.planNombre ?? "Plan activo"}
              </span>
            </div>
          </Link>
        )}

        {isCollapsed && user?.empresaNombre && (
          <div className="group/empresa relative flex justify-center py-3 select-none">
            <Link
              href="/empresa"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-su-bg-deep border border-su-border flex items-center justify-center text-[11px] font-bold text-su-text-muted shadow-sm hover:bg-su-bg-deep hover:border-su-border-strong transition-all duration-200"
            >
              {user.empresaNombre.charAt(0).toUpperCase()}
            </Link>

            <span className="
              absolute left-full ml-4 px-3 py-1.5 rounded-xl text-xs font-semibold
              su-brand whitespace-nowrap pointer-events-none z-50
              opacity-0 translate-x-1
              group-hover/empresa:opacity-100 group-hover/empresa:translate-x-0
              transition-all duration-150
            ">
              {user.empresaNombre}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-brand-indigo" />
            </span>
          </div>
        )}

        {user?.empresaNombre && <div className="mx-4 su-divider" />}

        {/* ── BOTÓN ACCIÓN PRINCIPAL ── */}
        <div className={["px-3 py-2", isCollapsed ? "flex justify-center" : ""].join(" ")}>
          <Link
            href="/ventas/nueva"
            onClick={onClose}
            className={[
              "group relative flex items-center transition-all duration-200 font-semibold text-sm",
              "su-brand hover:shadow-su-brand-lg hover:scale-[1.02]",
              isCollapsed
                ? "w-10 h-10 rounded-xl justify-center"
                : "w-full gap-3 px-4 py-3 rounded-2xl justify-center",
            ].join(" ")}
          >
            <Plus className={isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"} />
            {!isCollapsed && <span>Nueva Venta</span>}

            {isCollapsed && (
              <span className="
                absolute left-full ml-4 px-3 py-1.5 rounded-xl text-xs font-semibold
                su-brand whitespace-nowrap pointer-events-none z-50
                opacity-0 translate-x-1
                group-hover:opacity-100 group-hover:translate-x-0
                transition-all duration-150
              ">
                Nueva Venta
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-brand-indigo" />
              </span>
            )}
          </Link>
        </div>

        {/* ── Navegación ── */}
        <nav className={["flex-1 px-3 py-4 flex flex-col gap-1", isCollapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden scrollbar-none"].join(" ")}>

          {!isCollapsed && <p className="su-field-label px-4 mb-2">Menú</p>}

          {/* 1. Panel General */}
          <NavLink href="/dashboard" icon={LayoutDashboard} label="Panel General"
            isCollapsed={isCollapsed} pathname={pathname} onClick={onClose} />

          {/* 2. Ventas */}
          <NavLink href="/ventas/lista" icon={ShoppingBag} label="Ventas"
            isCollapsed={isCollapsed} pathname={pathname} onClick={onClose} />

          {/* 3. Facturas */}
          <NavLink href="/facturas" icon={Receipt} label="Facturas"
            isCollapsed={isCollapsed} pathname={pathname} onClick={onClose} />

          {/* 4. Clientes */}
          <NavLink href="/clientes" icon={Users} label="Clientes"
            isCollapsed={isCollapsed} pathname={pathname} onClick={onClose} />

          {/* 5. Proveedores ◄ Agregado: Botón nuevo */}
          <NavLink href="/proveedores" icon={Truck} label="Proveedores"
            isCollapsed={isCollapsed} pathname={pathname} onClick={onClose} />

          {/* 6. Productos */}
          <NavAccordion
            icon={Boxes} label="Productos"
            isCollapsed={isCollapsed} matchPrefix="/productos" pathname={pathname}
            flyoutChildren={<>
              <SubLink href="/productos/nuevo" icon={Plus} label="Nuevo producto" pathname={pathname} onClick={onClose} />
              <SubLink href="/productos" icon={List} label="Lista" pathname={pathname} onClick={onClose} />
              <SubLink href="/productos/ingresos" icon={Package} label="Ingresos" pathname={pathname} onClick={onClose} />
            </>}
          >
            <SubLinkIndented href="/productos/nuevo" icon={Plus} label="Nuevo producto" pathname={pathname} onClick={onClose} />
            <SubLinkIndented href="/productos/lista" icon={List} label="Lista" pathname={pathname} onClick={onClose} />
            <SubLinkIndented href="/productos/ingresoslista" icon={Package} label="Ingresos" pathname={pathname} onClick={onClose} />
          </NavAccordion>

          {/* 7. Firma */}
          <NavLink href="/firma" icon={PenLine} label="Firma"
            isCollapsed={isCollapsed} pathname={pathname} onClick={onClose} />

          {/* Owner */}
          {user?.rol === "OWNER" && (
            <>
              <div className="my-2 mx-2 su-divider" />
              {!isCollapsed && <p className="su-field-label px-4 mb-2 text-amber-500/60">Sistema</p>}
              <Link
                href="/owner" onClick={onClose}
                className={[
                  "group relative flex items-center gap-3.5 rounded-2xl text-sm font-medium transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "px-4 py-3",
                  pathname.startsWith("/owner")
                    ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white [box-shadow:4px_4px_12px_rgba(245,158,11,0.4),-2px_-2px_8px_rgba(255,255,255,0.5)]"
                    : "su-surface text-amber-600/70 dark:text-amber-400/60 hover:shadow-su-md hover:text-amber-600",
                ].join(" ")}
              >
                <Shield className={[
                  "shrink-0 transition-all duration-200",
                  isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                  pathname.startsWith("/owner") ? "text-white" : "text-amber-400/60 group-hover:scale-110",
                ].join(" ")} />
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-br from-amber-400 to-amber-500 text-white [box-shadow:3px_3px_10px_rgba(245,158,11,0.4)] whitespace-nowrap pointer-events-none opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50">
                    Panel Global
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-amber-400" />
                  </span>
                )}
                {!isCollapsed && (
                  <>
                    <span className="flex-1">Panel Global</span>
                    {pathname.startsWith("/owner") && <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />}
                  </>
                )}
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}