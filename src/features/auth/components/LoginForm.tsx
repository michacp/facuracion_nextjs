"use client";
// src/features/auth/components/LoginForm.tsx

import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import { useLogin } from "../hooks/useLogin";

// ─── Input Soft UI ────────────────────────────────────────────────────────────

function SoftInput({ icon: Icon, type, placeholder, value, onChange, required, rightSlot }: {
  icon: React.ElementType; type: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-su-text-subtle pointer-events-none" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full pl-11 pr-11 py-3 rounded-2xl text-sm
          text-su-text placeholder-su-text-subtle
          su-inset
          outline-none
          focus:[box-shadow:var(--su-shadow-inset-focus)] focus:border-su-border-strong
          transition-all duration-200
        "
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}

// ─── LoginForm ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const {
    identifier, password, rememberMe, loading, showPassword, error, checking,
    setIdentifier, setPassword, setRememberMe, togglePasswordVisibility, handleSubmit,
  } = useLogin();

  // ── Pantalla de verificación ──────────────────────────────────────────────
  if (checking) {
    return (
      <div className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-4 su-surface-lg">
        <div className="su-avatar su-brand w-14 h-14 rounded-2xl">
          <span className="text-white font-bold text-2xl">S</span>
          <div className="su-avatar-shine" />
        </div>
        <div className="flex items-center gap-2.5">
          <div
            className="w-4 h-4 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--brand-blue)", borderTopColor: "transparent" }}
          />
          <span className="text-sm font-medium" style={{ color: "var(--su-text-muted)" }}>
            Comprobando sesión…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-3xl p-8 flex flex-col gap-6 su-surface-lg">

      {/* Logomark */}
      <div className="flex justify-center">
        <div className="su-avatar su-brand w-14 h-14 rounded-2xl">
          <span className="text-white font-bold text-2xl">S</span>
          <div className="su-avatar-shine" />
        </div>
      </div>

      {/* Cabecera */}
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-bold text-su-text tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-sm text-su-text-muted">Ingresa tus credenciales para continuar</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-medium text-red-500 dark:text-red-400 su-inset border-red-200/60 dark:border-red-900/40">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-2">
          <label className="su-field-label">Usuario o email</label>
          <SoftInput
            icon={User} type="text" placeholder="tu@email.com"
            value={identifier} onChange={(e) => setIdentifier(e.target.value)} required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="su-field-label">Contraseña</label>
          <SoftInput
            icon={Lock}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightSlot={
              <button type="button" onClick={togglePasswordVisibility}
                className="p-1 text-su-text-subtle hover:text-su-text transition-colors duration-150">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        {/* Checkbox — arreglado para modo claro */}
        <label className="flex items-center gap-3 cursor-pointer select-none group mt-1">
          <div className="relative shrink-0">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="w-5 h-5 rounded-lg transition-all duration-200 flex items-center justify-center"
              style={
                rememberMe
                  ? {
                      background: "linear-gradient(135deg, var(--brand-blue), var(--brand-sky))",
                      boxShadow: "var(--su-shadow-brand)",
                      border: "1px solid transparent",
                    }
                  : {
                      background: "var(--su-bg)",
                      boxShadow: "var(--su-shadow-inset)",
                      border: "1px solid var(--su-border-strong)", // ← borde visible en claro
                    }
              }
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-su-text-muted group-hover:text-su-text transition-colors duration-150">
            Recordar mi usuario
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            mt-1 w-full py-3 rounded-2xl text-sm font-bold text-white relative overflow-hidden
            su-brand
            hover:[box-shadow:var(--su-shadow-brand-lg)]
            active:[box-shadow:var(--su-shadow-inset-press)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 tracking-wide
          "
        >
          <div className="absolute inset-x-4 top-1 h-px bg-white/30 rounded-full pointer-events-none" />
          <span className="relative">{loading ? "Ingresando..." : "Ingresar"}</span>
        </button>
      </form>
    </div>
  );
}