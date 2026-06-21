// src/features/firma/types/firma.types.ts

export interface SignatureStatus {
    alias: string;
    issue_date: string;       // ISO string
    expiration_date: string;  // ISO string
}

export interface SaveSignatureDto {
    file: File;
    password: string;
}

export interface SaveSignatureResponse {
    message: string;
}