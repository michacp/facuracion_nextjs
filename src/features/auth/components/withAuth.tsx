// src/features/auth/components/withAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function ProtectedPage(props: T) {
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

    if (!verified) return null;

    return <Component {...props} />;
  };
}