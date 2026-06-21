// src/features/firma/components/FirmaUploadModal.tsx
"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { firmaApi } from "../../api/firma.api";

interface Props {
  onClose: (result: "guardado" | "cancelado") => void;
}

export function FirmaUploadModal({ onClose }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword]         = useState("");
  const [isDragging, setIsDragging]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Drag & drop ───────────────────────────────────────────────────────────

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }
  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  // ── Subir ─────────────────────────────────────────────────────────────────

  async function onUpload() {
    if (!selectedFile || !password) {
      toast.error("Selecciona un archivo y escribe la contraseña");
      return;
    }
    setUploading(true);
    try {
      await firmaApi.saveSignature(selectedFile, password);
      onClose("guardado");
    } catch (err) {
      console.error("Error al subir la firma:", err);
      toast.error("Error al subir la firma");
    } finally {
      setUploading(false);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose("cancelado"); }}
    >
      {/* Panel */}
      <div
        className="su-surface-lg rounded-3xl w-full max-w-sm flex flex-col gap-5 p-6
                   animate-[float-in_0.3s_cubic-bezier(0.34,1.4,0.64,1)_forwards]"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="su-brand w-9 h-9 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--su-text)" }}>
                Cargar Firma Digital
              </p>
              <p className="text-[11px]" style={{ color: "var(--su-text-muted)" }}>
                Archivo .p12 o .pfx
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose("cancelado")}
            className="su-icon-btn w-8 h-8 rounded-xl text-sm"
          >✕</button>
        </div>

        <div className="su-divider" />

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="su-inset rounded-2xl p-6 flex flex-col items-center justify-center gap-3
                     cursor-pointer transition-all duration-200 select-none"
          style={{
            border: isDragging
              ? "1.5px dashed var(--brand-indigo)"
              : "1.5px dashed var(--su-border-strong)",
            background: isDragging ? "rgba(102,16,242,0.04)" : undefined,
          }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={1.5}
            style={{ color: isDragging ? "var(--brand-indigo)" : "var(--su-text-subtle)" }}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>

          {selectedFile ? (
            <div className="text-center">
              <p className="text-xs font-semibold truncate max-w-[200px]"
                style={{ color: "var(--su-text)" }}>
                {selectedFile.name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--su-text-muted)" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: "var(--su-text-muted)" }}>
                Arrastra tu archivo aquí
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--su-text-subtle)" }}>
                o haz clic para seleccionar
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".p12,.pfx"
            className="hidden"
            onChange={onFileSelected}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="su-field-label pl-1">Contraseña</label>
          <div className="su-inset rounded-2xl flex items-center pr-2"
               style={{ border: "1px solid var(--su-border)" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onUpload()}
              placeholder="Contraseña del archivo"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none
                         placeholder:text-[var(--su-text-subtle)]"
              style={{ color: "var(--foreground)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="su-icon-btn w-8 h-8 rounded-xl shrink-0 flex items-center justify-center"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                /* Ojo tachado — contraseña visible */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                /* Ojo abierto — contraseña oculta */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => onClose("cancelado")}
            disabled={uploading}
            className="su-icon-btn flex-1 rounded-2xl py-2.5 text-sm font-medium
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onUpload}
            disabled={uploading || !selectedFile || !password}
            className="su-brand flex-1 rounded-2xl py-2.5 text-sm font-bold
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-150 hover:shadow-[var(--su-shadow-brand-lg)]"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30
                                 border-t-white animate-spin inline-block" />
                Subiendo…
              </span>
            ) : (
              "Subir Firma"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}