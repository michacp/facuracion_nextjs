// src/features/firma/components/FirmaPage.tsx
// (o donde lo montes dentro de tu app/  router de Next.js)
"use client";

import { useState } from "react";
import { useFirma } from "../../hooks/useFirma";
import { FirmaUploadModal } from "./FirmaUploadModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-EC", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function getDiasRestantes(expiration_date: string): number {
  const diffMs = new Date(expiration_date).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function diasColor(dias: number): string {
  if (dias <= 30)  return "#dc2626";   // rojo
  if (dias <= 90)  return "#d97706";   // naranja
  return "#16a34a";                    // verde
}
function diasBg(dias: number): string {
  if (dias <= 30)  return "rgba(239,68,68,0.08)";
  if (dias <= 90)  return "rgba(217,119,6,0.08)";
  return "rgba(22,163,74,0.08)";
}
function diasBorder(dias: number): string {
  if (dias <= 30)  return "rgba(239,68,68,0.2)";
  if (dias <= 90)  return "rgba(217,119,6,0.2)";
  return "rgba(22,163,74,0.2)";
}

// ── Componente ────────────────────────────────────────────────────────────────

export function FirmaPage() {
  const { signatureStatus, loading, reload } = useFirma();
  const [modalOpen, setModalOpen] = useState(false);

  function abrirModal() { setModalOpen(true); }

  function onModalClose(result: "guardado" | "cancelado") {
    setModalOpen(false);
    if (result === "guardado") reload();
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--brand-indigo)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "var(--su-text-muted)" }}>
          Cargando estado de firma…
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center px-4 py-8">
        <div className="w-full max-w-md flex flex-col gap-5">

          {/* ── Card firma ── */}
          {signatureStatus ? (
            <div className="su-surface-md rounded-3xl overflow-hidden">

              {/* Header de la card */}
              <div className="flex items-center gap-4 px-6 pt-6 pb-4">
                <div className="su-brand w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
                  </svg>
                  <span className="su-avatar-shine" />
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: "var(--su-text)" }}>
                    Firma Digital
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--su-text-muted)" }}>
                    {signatureStatus.alias}
                  </p>
                </div>
              </div>

              <div className="su-divider mx-6" />

              {/* Cuerpo */}
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Fecha emisión */}
                <div className="flex items-center justify-between">
                  <span className="su-field-label">Fecha de emisión</span>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {fmtFecha(signatureStatus.issue_date)}
                  </span>
                </div>

                {/* Fecha expiración */}
                <div className="flex items-center justify-between">
                  <span className="su-field-label">Fecha de expiración</span>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {fmtFecha(signatureStatus.expiration_date)}
                  </span>
                </div>

                {/* Días restantes */}
                {(() => {
                  const dias = getDiasRestantes(signatureStatus.expiration_date);
                  return (
                    <div className="flex items-center justify-between">
                      <span className="su-field-label">Días restantes</span>
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          color:      diasColor(dias),
                          background: diasBg(dias),
                          border:     `1px solid ${diasBorder(dias)}`,
                        }}
                      >
                        {/* Dot */}
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: diasColor(dias) }}
                        />
                        {dias} días
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* ── Sin firma ── */
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                background: "rgba(217,119,6,0.07)",
                border: "1px solid rgba(217,119,6,0.22)",
              }}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}
                style={{ color: "#d97706" }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#92400e" }}>
                No hay ninguna firma registrada
              </p>
            </div>
          )}

          {/* ── Botón agregar / editar ── */}
          <button
            onClick={abrirModal}
            className="su-brand rounded-2xl py-3 text-sm font-bold flex items-center
                       justify-center gap-2 transition-all duration-150
                       hover:shadow-[var(--su-shadow-brand-lg)]"
          >
            {/* Ícono + / lápiz */}
            {signatureStatus ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            {signatureStatus ? "Editar Firma" : "Agregar Firma"}
          </button>

        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && <FirmaUploadModal onClose={onModalClose} />}
    </>
  );
}