// src/lib/axios.ts
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie"; // 👈 mismo paquete que ya usas en useLogin

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔒 Interceptor de Petición — lee el token de la cookie
api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? Cookies.get("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🎯 Interceptor de Respuesta — sin cambios
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const backendMessage = error.response.data?.message;
            const status = error.response.status;

            const messageToShow = Array.isArray(backendMessage)
                ? backendMessage[0]
                : backendMessage || "Ocurrió un error en el servidor.";

            if (status === 401) {
                toast.error("Acceso denegado", { description: messageToShow });
            } else if (status === 400) {
                toast.warning("Datos inválidos", { description: messageToShow });
            } else {
                toast.error(`Error (${status})`, { description: messageToShow });
            }
        } else {
            toast.error("Error de conexión", {
                description: "No se pudo conectar con el servidor. Revisa tu internet."
            });
        }

        return Promise.reject(error);
    }
);