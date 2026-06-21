//src\features\auth\api\auth.api.ts
import { api } from "@/shared/lib/axios";
import { LoginDto, LoginResponse } from "../types/auth.types";


export const authApi = {
    login: async (credentials: LoginDto): Promise<LoginResponse> => {
        // Enviamos identifier, password y rememberMe a NestJS
        const { data } = await api.post<LoginResponse>("/auth/login", credentials);
        return data;
    },
};