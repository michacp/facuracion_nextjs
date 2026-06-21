"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      // 💡 Opcional: Aquí podrías llamar a authApi.logout() si tu backend en NestJS
      // necesita invalidar el token en una lista negra o destruir la sesión en Redis.
      
      // 🍪 Borramos la cookie del token en el cliente
      Cookies.remove("token");

      // 🔄 Forzamos un refresco para limpiar estados del servidor y redirigimos
      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
    >
      <LogOut className="w-4 h-4" />
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}