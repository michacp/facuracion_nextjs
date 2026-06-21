"use client";

import { useEffect, useRef, useState } from "react";
import type { GenericChipsSelectorProps, Item } from "./types";
import { chipTokens } from "./utils";

function highlightMatch(text: string, query: string, isDark: boolean) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const highlightColor = isDark ? "var(--su-text)" : "var(--brand-indigo)";
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: highlightColor, fontWeight: 700 }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

export function GenericChipsSelector({
  label = "Elementos seleccionados",
  availableItems,
  preselectedItems = [],
  onSelectionChange,
  isDark = false,
}: GenericChipsSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Preseleccionados: solo corre cuando preselectedItems cambia
  //    y availableItems ya tiene datos (evita cargar antes de tener el catálogo)
  useEffect(() => {
    if (preselectedItems.length > 0 && availableItems.length > 0) {
      setSelectedItems(preselectedItems);
      onSelectionChange(preselectedItems.map((i) => i.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedItems, availableItems]);

  // ── Reset SOLO cuando availableItems cambia a un array vacío
  //    (cambio de contexto real, ej: el padre limpió las opciones)
  //    NO resetear si hay preseleccionados — ese era el bug
  useEffect(() => {
    if (availableItems.length === 0) {
      setSelectedItems([]);
      setFilter("");
      onSelectionChange([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableItems]);

  // ── Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(filter.toLowerCase()) &&
      !selectedItems.some((s) => s.id === item.id)
  );

  function selectItem(item: Item) {
    const next = [...selectedItems, item];
    setSelectedItems(next);
    onSelectionChange(next.map((i) => i.id));
    setFilter("");
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function removeItem(item: Item) {
    const next = selectedItems.filter((i) => i.id !== item.id);
    setSelectedItems(next);
    onSelectionChange(next.map((i) => i.id));
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && filter === "" && selectedItems.length > 0) {
      removeItem(selectedItems[selectedItems.length - 1]);
    }
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" && filteredItems.length > 0) {
      e.preventDefault();
      selectItem(filteredItems[0]);
    }
  }

  return (
    <div ref={wrapperRef} className="flex flex-col gap-1.5 relative">
      <label className="su-field-label pl-1">{label}</label>

      <div
        className="su-inset rounded-2xl px-3 py-2 flex flex-wrap gap-1.5 cursor-text min-h-[44px] items-center transition-shadow duration-150"
        style={open ? { boxShadow: "var(--su-shadow-inset-focus)", borderColor: "var(--su-border-strong)" } : undefined}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selectedItems.map((item, i) => {
          const { background, color } = chipTokens(i, isDark);
          return (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none"
              style={{
                background,
                color,
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {item.name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                className="ml-0.5 rounded-full w-3.5 h-3.5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
                aria-label={`Eliminar ${item.name}`}
              >
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selectedItems.length === 0 ? "Buscar…" : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-[var(--su-text-subtle)]"
          style={{ color: "var(--foreground)" }}
          disabled={availableItems.length === 0}
          autoComplete="off"
        />
      </div>

      {open && filteredItems.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1.5 su-surface-md rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
          style={{ boxShadow: "var(--su-shadow-lg)" }}
        >
          {filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); selectItem(item); }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--su-bg-deep)] transition-colors duration-100"
              style={{ color: "var(--foreground)" }}
            >
              {filter ? highlightMatch(item.name, filter, isDark) : item.name}
            </button>
          ))}
        </div>
      )}

      {open && availableItems.length > 0 && filteredItems.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1.5 su-surface-md rounded-2xl px-4 py-3 text-xs"
          style={{ color: "var(--su-text-muted)", boxShadow: "var(--su-shadow-md)" }}
        >
          Sin resultados para &ldquo;{filter}&rdquo;
        </div>
      )}
    </div>
  );
}