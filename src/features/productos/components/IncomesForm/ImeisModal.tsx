"use client";

import { useEffect, useRef, useState } from "react";
import { imeiApi } from "../../api/imei.api";
import type { MotivoNoDisponible } from "../../types/imei.types";

interface ImeisModalProps {
  productoNombre: string;
  minImeis?: number;
  maxImeis?: number;
  imeisIniciales: string[];
  onClose: () => void;
  onSave: (imeis: string[]) => void;
}

type EstadoImei = "idle" | "checking" | "ok" | "error";

interface FilaEstado {
  estado: EstadoImei;
  motivo?: MotivoNoDisponible | null;
}

const MENSAJE_MOTIVO: Record<MotivoNoDisponible, string> = {
  YA_REGISTRADO: "Ya está registrado",
  DUPLICADO_EN_LISTA: "Repetido en la lista",
};

export function ImeisModal({
  productoNombre,
  minImeis = 1,
  maxImeis = 2,
  imeisIniciales,
  onClose,
  onSave,
}: ImeisModalProps) {
  const [imeis, setImeis] = useState<string[]>(() => {
    const base = [...imeisIniciales];
    while (base.length < maxImeis) base.push("");
    return base.slice(0, maxImeis);
  });

  const [estados, setEstados] = useState<FilaEstado[]>(
    () => imeis.map(() => ({ estado: "idle" }))
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function actualizar(i: number, valor: string) {
    const limpio = valor.replace(/\D/g, "").slice(0, 15);
    setImeis((prev) => prev.map((v, idx) => (idx === i ? limpio : v)));
  }

  // ── Validación contra backend (debounced) — solo campos con contenido ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const completos = imeis
      .map((v, i) => ({ v: v.trim(), i }))
      .filter((x) => x.v.length >= 5);

    if (completos.length === 0) {
      setEstados(imeis.map(() => ({ estado: "idle" })));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setEstados((prev) =>
        imeis.map((_, i) =>
          completos.some((c) => c.i === i) ? { estado: "checking" } : prev[i] ?? { estado: "idle" }
        )
      );

      try {
        const res = await imeiApi.checkDisponibilidad(completos.map((c) => c.v));
        setEstados((prev) => {
          const next = [...prev];
          completos.forEach((c, idx) => {
            const r = res.resultados[idx];
            next[c.i] = r?.disponible
              ? { estado: "ok" }
              : { estado: "error", motivo: r?.motivo };
          });
          imeis.forEach((v, i) => {
            if (!completos.some((c) => c.i === i)) next[i] = { estado: "idle" };
          });
          return next;
        });
      } catch (err) {
        console.error("Error verificando IMEIs:", err);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imeis]);

  const llenos = imeis.filter((v) => v.trim().length > 0);
  const cumpleMinimo = llenos.length >= minImeis;
  const hayError = imeis.some((v, i) => v.trim() && estados[i]?.estado === "error");
  const hayChecking = imeis.some((v, i) => v.trim() && estados[i]?.estado === "checking");
  const puedeGuardar = cumpleMinimo && !hayError && !hayChecking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="su-surface-md rounded-3xl p-6 w-full max-w-md flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--su-text)" }}>
            IMEIs — {productoNombre}
          </h3>
          <p className="text-xs mt-1" style={{ color: "var(--su-text-muted)" }}>
            Ingresa {minImeis} IMEI{minImeis > 1 ? "s" : ""}
            {maxImeis > minImeis ? ` (hasta ${maxImeis} si es dual-SIM)` : ""}
          </p>
        </div>

        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {imeis.map((valor, i) => {
            const fila = estados[i] ?? { estado: "idle" };
            const esOpcional = i + 1 > minImeis;
            const borderColor =
              fila.estado === "error"
                ? "#dc2626"
                : fila.estado === "ok"
                ? "#16a34a"
                : "var(--su-border)";

            return (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[11px] pl-1" style={{ color: "var(--su-text-muted)" }}>
                  IMEI {i + 1} {esOpcional && "(opcional — dual SIM)"}
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      value={valor}
                      onChange={(e) => actualizar(i, e.target.value)}
                      placeholder="354123456789012"
                      maxLength={15}
                      inputMode="numeric"
                      className="su-inset rounded-xl px-3 py-2 pr-8 text-sm outline-none w-full tabular-nums"
                      style={{ color: "var(--foreground)", borderColor }}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      {fila.estado === "checking" && (
                        <span
                          className="block w-3.5 h-3.5 rounded-full border-2 animate-spin"
                          style={{ borderColor: "var(--su-text-subtle)", borderTopColor: "transparent" }}
                        />
                      )}
                      {fila.estado === "ok" && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {fila.estado === "error" && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
                {fila.estado === "error" && fila.motivo && (
                  <span className="text-[11px] pl-1" style={{ color: "#dc2626" }}>
                    {MENSAJE_MOTIVO[fila.motivo]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="su-icon-btn rounded-2xl px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!puedeGuardar}
            onClick={() => onSave(imeis.map((v) => v.trim()).filter(Boolean))}
            className="su-brand rounded-2xl px-4 py-2 text-sm font-bold
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {hayChecking ? "Verificando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}