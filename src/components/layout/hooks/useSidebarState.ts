"use client";
// src/hooks/useSidebarState.ts

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sidebar:collapsed";

export function useSidebarState() {
    // ── Hidration-safe: siempre arranca en false (igual que el servidor).
    //    El efecto de abajo sincroniza con localStorage después del mount,
    //    evitando el mismatch de hydration.
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // ── Al montar: leer localStorage y aplicar el valor real ────────────────
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) === "true";
        setIsCollapsed(stored);
        setMounted(true);
    }, []);

    // ── Persistir cada cambio posterior al mount ─────────────────────────────
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }, [isCollapsed, mounted]);

    const toggleOpen = useCallback(() => setIsOpen(v => !v), []);
    const toggleCollapse = useCallback(() => setIsCollapsed(v => !v), []);
    const close = useCallback(() => setIsOpen(false), []);

    return { isOpen, isCollapsed, toggleOpen, toggleCollapse, close };
}