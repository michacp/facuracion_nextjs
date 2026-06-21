// src/components/common/GenericSelector/index.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { GenericSelectorProps, Item } from "./types";
import { filterOptions } from "./utils";

function highlightMatch(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: "var(--brand-indigo)", fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function GenericSelector({
  label = "Seleccione una opción",
  placeholder = "Buscar...",
  options,
  icon,
  value,
  onSelect,
  onSearch,
  onSearchExplicit,
  initialOptions = [],
}: GenericSelectorProps) {
  const [inputText, setInputText]   = useState("");
  const [filtered, setFiltered]     = useState<Item[]>([]);
  const [open, setOpen]             = useState(false);
  const [selected, setSelected]     = useState<Item | null>(value ?? null);
  const [searching, setSearching]   = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Valor controlado desde fuera (autoselección tras crear cliente)
  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
      setInputText(value?.name ?? "");
    }
  }, [value]);

  // Cuando llegan nuevos options del backend (tras búsqueda explícita),
  // mostramos esos resultados directamente
  useEffect(() => {
    if (options.length > 0) {
      // Si hay texto filtramos en memoria, si no mostramos todos
      setFiltered(inputText ? filterOptions(options, inputText) : options);
    }
  }, [options]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setInputText(selected?.name ?? "");
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [selected]);

  // ── Focus: muestra initialOptions o lo que ya haya en options ─────────────
  function onFocus() {
    if (filtered.length === 0) {
      // Prioridad: options ya cargados → initialOptions → vacío
      const base = options.length > 0 ? options : initialOptions;
      setFiltered(inputText ? filterOptions(base, inputText) : base);
    }
    setOpen(true);
  }

  // ── Cambio de texto: filtra en memoria en tiempo real ─────────────────────
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setInputText(text);
    setOpen(true);

    if (text === "") {
      setSelected(null);
      onSelect(null);
      // Volver a mostrar la lista base
      const base = options.length > 0 ? options : initialOptions;
      setFiltered(base);
      return;
    }

    // Filtrado en memoria sobre lo que ya tenemos (initialOptions + options del backend)
    const base = options.length > 0 ? options : initialOptions;
    setFiltered(filterOptions(base, text));
  }

  // ── Enter o clic en lupa: dispara búsqueda al backend ─────────────────────
  async function triggerBackendSearch() {
    if (!inputText.trim()) return;
    if (!onSearchExplicit && !onSearch) return;

    setSearching(true);
    try {
      if (onSearchExplicit) {
        await onSearchExplicit(inputText);
      } else if (onSearch) {
        await onSearch(inputText);
      }
      setOpen(true);
    } finally {
      setSearching(false);
    }
  }

  function selectOption(item: Item) {
    setSelected(item);
    setInputText(item.name);
    setFiltered(options.length > 0 ? options : initialOptions);
    setOpen(false);
    onSelect(item);
  }

  function clearField() {
    setSelected(null);
    setInputText("");
    const base = initialOptions.length > 0 ? initialOptions : [];
    setFiltered(base);
    onSelect(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setInputText(selected?.name ?? "");
      setOpen(false);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // Si hay resultados filtrados, selecciona el primero
      if (filtered.length > 0 && !onSearchExplicit) {
        selectOption(filtered[0]);
      } else {
        // Busca en el backend
        triggerBackendSearch();
      }
    }
  }

  const hasValue = inputText.length > 0;

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1.5 relative">
      <label className="su-field-label pl-1">{label}</label>

      <div
        className="su-inset rounded-2xl flex items-center gap-1 px-3 transition-all duration-150"
        style={
          open
            ? { borderColor: "var(--su-border-strong)", boxShadow: "var(--su-shadow-inset-focus)" }
            : undefined
        }
      >
        {/* Lupa — dispara búsqueda al backend */}
        <button
          type="button"
          onClick={triggerBackendSearch}
          disabled={searching || !hasValue}
          className="su-icon-btn w-6 h-6 rounded-lg shrink-0 disabled:opacity-30"
          aria-label="Buscar"
          title="Buscar en el sistema (Enter)"
        >
          {searching ? (
            <svg
              className="w-3 h-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <Search className="w-3 h-3" />
          )}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={inputText}
          placeholder={placeholder}
          onChange={onInputChange}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
          style={{ color: "var(--foreground)" }}
        />

        {/* Botón limpiar */}
        {hasValue && (
          <button
            type="button"
            onClick={clearField}
            className="su-icon-btn w-6 h-6 rounded-lg shrink-0"
            aria-label="Limpiar selección"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {icon && (
          <span className="shrink-0 ml-1" style={{ color: "var(--su-text-muted)" }}>
            {icon}
          </span>
        )}
      </div>

      {/* Dropdown resultados */}
      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 su-surface-md rounded-2xl overflow-hidden max-h-52 overflow-y-auto"
          style={{ boxShadow: "var(--su-shadow-lg)" }}
        >
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); selectOption(item); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 hover:bg-[var(--su-bg-deep)]"
              style={{
                color: "var(--foreground)",
                background: selected?.id === item.id ? "rgba(102,16,242,0.06)" : undefined,
                fontWeight: selected?.id === item.id ? 600 : undefined,
              }}
            >
              {inputText ? highlightMatch(item.name, inputText) : item.name}
            </button>
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {open && filtered.length === 0 && inputText && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 su-surface-md rounded-2xl px-4 py-3 text-xs"
          style={{ color: "var(--su-text-muted)", boxShadow: "var(--su-shadow-md)" }}
        >
          Sin resultados para &ldquo;{inputText}&rdquo; — presiona Enter o{" "}
          <button
            type="button"
            onClick={triggerBackendSearch}
            className="underline font-semibold"
            style={{ color: "var(--brand-indigo)" }}
          >
            buscar en el sistema
          </button>
        </div>
      )}
    </div>
  );
}