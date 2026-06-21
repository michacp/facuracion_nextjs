"use client";
// src/app/(dashboard)/layout.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 👈 agregar
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useSidebarState } from "@/components/layout/hooks/useSidebarState";
import { JwtPayload } from "@/features/auth/types/auth.types";

function useJwtUser(): JwtPayload | null {
  const [user, setUser] = useState<JwtPayload | null>(null);
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;
    try { setUser(jwtDecode<JwtPayload>(token)); }
    catch (err) { console.error("Error al decodificar el JWT:", err); }
  }, []);
  
  return user;
}

// 👇 Guard integrado en el mismo archivo
function useAuthGuard() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
    } else {
      setVerified(true);
    }
  }, [router]);

  return verified;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const verified = useAuthGuard(); // 👈
  const user = useJwtUser();
  const { isOpen, isCollapsed, toggleOpen, toggleCollapse, close } = useSidebarState();

  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) toggleCollapse();
    else toggleOpen();
  };

  if (!verified) return null; // 👈 o tu <Spinner />

  return (
    <div className="flex h-screen overflow-hidden bg-su-bg transition-colors duration-200">
      <Sidebar isOpen={isOpen} isCollapsed={isCollapsed} onClose={close} user={user} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={handleMenuToggle} isSidebarCollapsed={isCollapsed} user={user} />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}