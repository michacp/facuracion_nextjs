"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import Cookies from "js-cookie";
import { AxiosError } from "axios";

export function useLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Estados del formulario
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // 🚨 Estado para almacenar el mensaje de error del backend
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("remembered_user");
        if (savedUser) {
            setIdentifier(savedUser);
            setRememberMe(true);
        }
        if (Cookies.get("token")) {
            router.replace("/dashboard");
        } else {
            setChecking(false); // ← solo muestra el form si no hay token
        }
    }, []);

    const togglePasswordVisibility = () => setShowPassword((p) => !p);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null); // 🔄 Limpiamos errores anteriores antes de intentar de nuevo

        try {
            const response = await authApi.login({
                usernameOrEmail: identifier,
                password,
                rememberMe,
            });

            if (response && response.access_token) {
                Cookies.set("token", response.access_token, {
                    expires: rememberMe ? 7 : undefined,
                    secure: true,
                    sameSite: "strict"
                });

                if (rememberMe) {
                    localStorage.setItem("remembered_user", identifier);
                } else {
                    localStorage.removeItem("remembered_user");
                }

                router.push("/dashboard");
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string | string[] }>;
            const msg = axiosError.response?.data?.message;
            setError(
                Array.isArray(msg) ? msg[0] : msg ?? "Error al iniciar sesión"
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        identifier,
        password,
        rememberMe,
        loading,
        showPassword,
        error, 
        setIdentifier,
        setPassword,
        setRememberMe,
        togglePasswordVisibility,
        handleSubmit,
        checking, 
    };
}