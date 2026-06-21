"use client";
// src/features/auth/hooks/useCurrentUser.ts

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "../types/auth.types";

/** Decodifica el JWT guardado en la cookie "token" y expone el usuario logueado */
export function useCurrentUser(): JwtPayload | null {
    const [user, setUser] = useState<JwtPayload | null>(null);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) return;
        try {
            setUser(jwtDecode<JwtPayload>(token));
        } catch (err) {
            console.error("Error al decodificar el JWT:", err);
        }
    }, []);

    return user;
}