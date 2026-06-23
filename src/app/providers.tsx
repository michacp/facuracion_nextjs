"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
// Ajusta esta ruta según dónde tengas configurado tu Firebase
import { db } from "@/lib/firebase"; 
import { doc, onSnapshot } from "firebase/firestore";

// ── GUARDIÁN DE VERSIONES ──────────────────────────────────────────────────
// Este componente escucha Firestore en tiempo real y detecta cambios.
function VersionGuard({ children }: { children: React.ReactNode }) {
  const versionActual = useRef<string | null>(null);

  useEffect(() => {
    // Apuntamos al documento que maneja la versión en producción
    const docRef = doc(db, "configuracion", "version_app");

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const nuevaVersion = data.version;

        // 1. Si es la primera vez que el usuario entra, guardamos la versión actual en memoria
        if (!versionActual.current) {
          versionActual.current = nuevaVersion;
          return;
        }

        // 2. Si la versión en Firestore cambia, disparamos la recarga limpia
        if (nuevaVersion !== versionActual.current) {
          console.log("Nueva versión detectada en Firebase. Recargando aplicación...");
          
          // Nos desuscribimos antes de recargar por buena práctica
          unsubscribe(); 
          
          // Forzar recarga del navegador para descargar los nuevos archivos estáticos
          window.location.reload();
        }
      }
    });

    // Limpieza del listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}

// ── PROVIDERS GLOBAL ───────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Envolvemos el árbol completo aquí. Así proteges tanto las rutas 
        públicas como las del dashboard privado.
      */}
      <VersionGuard>
        {children}
      </VersionGuard>
      <Toaster richColors position="top-right" closeButton />
    </ThemeProvider>
  );
}