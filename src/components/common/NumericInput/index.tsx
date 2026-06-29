"use client";

import { useEffect, useState } from "react";

// ── Helper: selecciona todo al hacer focus ────────────────────────────────────

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

// ── Helpers de parseo ──────────────────────────────────────────────────────────

/** Normaliza coma a punto para poder usar parseFloat */
function normalizar(texto: string): string {
  return texto.replace(",", ".");
}

/**
 * Determina si un caracter es válido mientras se escribe un número.
 * Permite dígitos, un único separador decimal (. o ,) y, si allowNegative,
 * un signo "-" al inicio.
 */
function esTextoParcialValido(texto: string, allowNegative: boolean): boolean {
  if (texto === "") return true; // vacío temporal permitido mientras se edita
  const patron = allowNegative ? /^-?\d*[.,]?\d*$/ : /^\d*[.,]?\d*$/;
  return patron.test(texto);
}

// ── Componente ─────────────────────────────────────────────────────────────────

interface NumericInputProps {
  value: number;
  onChange: (valor: number) => void;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Input numérico controlado que:
 * - Mantiene texto local mientras el usuario escribe (no se resetea a 0 al borrar).
 * - Acepta "," y "." como separador decimal.
 * - Bloquea cualquier caracter que no sea dígito/decimal (no permite que un
 *   caracter inválido se "filtre" y rompa el valor a NaN/0).
 * - Al perder el foco (blur), si el texto no es un número válido o queda
 *   vacío, fuerza el valor a 0 (tanto visualmente como en el estado padre).
 */
export function NumericInput({
  value,
  onChange,
  min,
  max,
  step,
  allowNegative = false,
  className,
  disabled,
  placeholder,
}: NumericInputProps) {
  // Texto que se muestra en el input mientras el usuario edita.
  const [texto, setTexto] = useState(() => String(value));
  // Si el usuario está editando activamente, no pisamos su texto con el valor
  // del padre (evita que "3," se convierta de vuelta a "3" en cada render).
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (!editando) {
      setTexto(String(value));
    }
  }, [value, editando]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nuevoTexto = e.target.value;

    // Bloquea caracteres no numéricos (letras, símbolos, múltiples comas, etc.)
    if (!esTextoParcialValido(nuevoTexto, allowNegative)) {
      return;
    }

    setTexto(nuevoTexto);

    // Si el texto representa un número completo y válido, propagamos ya
    // mismo al padre (para que cálculos como subtotal se actualicen en vivo).
    const normalizado = normalizar(nuevoTexto);
    if (normalizado !== "" && normalizado !== "-" && !normalizado.endsWith(".")) {
      const parsed = Number(normalizado);
      if (!Number.isNaN(parsed)) {
        onChange(parsed);
      }
    }
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    setEditando(true);
    selectOnFocus(e);
  }

  function handleBlur() {
    setEditando(false);

    const normalizado = normalizar(texto);
    const parsed = Number(normalizado);

    if (texto === "" || Number.isNaN(parsed)) {
      // Texto vacío o inválido al salir del campo → forzar a 0
      setTexto("0");
      onChange(0);
      return;
    }

    // Texto válido (puede tener "," como decimal, o un "." final como "3."):
    // normalizamos la vista al número final y avisamos al padre.
    setTexto(String(parsed));
    onChange(parsed);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={texto}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
}