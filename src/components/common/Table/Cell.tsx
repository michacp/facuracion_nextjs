// src/components/common/Table/Cell.tsx
import type { ReactNode } from "react";

interface CellProps {
  main: ReactNode;
  sub?: ReactNode;
  align?: "left" | "right" | "center";
  font?: "normal" | "mono";
}

export function Cell({ main, sub, align = "left", font = "normal" }: CellProps) {
  const alignCls =
    align === "right"  ? "items-end"
    : align === "center" ? "items-center"
    : "items-start";

  const fontCls = font === "mono" ? "font-mono" : "";

  return (
    <div className={`flex flex-col gap-0.5 min-w-0 overflow-hidden ${alignCls}`}>
      {/* main — tipografía principal */}
      <div
        className={`text-sm font-medium leading-snug truncate max-w-full ${fontCls}`}
        style={{ color: "var(--foreground)" }}
      >
        {main}
      </div>

      {/* sub — tipografía secundaria, solo si existe */}
      {sub !== undefined && sub !== null && (
        <div
          className="text-[11px] leading-snug truncate max-w-full"
          style={{ color: "var(--su-text-muted)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}