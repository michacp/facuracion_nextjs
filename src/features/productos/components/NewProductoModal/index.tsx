"use client";

import { useEffect } from "react";
import { ProductFormPage } from "../ProductFormPage";
import type { SaveItemResponseDto } from "../../types/saveItemResponse.types";

interface Props {
  onClose: (result?: SaveItemResponseDto) => void;
}

export function NewProductoModal({ onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="su-surface-lg rounded-3xl w-full max-w-4xl max-h-[90vh]
                   overflow-y-auto relative"
        style={{ animation: "float-in 0.3s cubic-bezier(0.34,1.4,0.64,1) forwards" }}
      >
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={() => onClose()}
          className="su-icon-btn absolute top-4 right-4 w-8 h-8 rounded-xl z-10"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <ProductFormPage onSuccess={(result) => onClose(result)} />
      </div>
    </div>
  );
}