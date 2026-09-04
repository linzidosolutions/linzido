"use client";

import { cn } from "@/lib/utils";

/**
 * LINZIDO® wordmark.
 * Uses Bebas Neue (--font-wordmark) to match the brand mark:
 * heavy all-caps letters + a red circled ® symbol.
 *
 * `mark={false}` removes the ® (used where space is very tight).
 */
export default function Logo({
  className,
  mark = true,
}: {
  className?: string;
  mark?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{
        fontFamily: "var(--font-wordmark), Impact, sans-serif",
        fontWeight: 400,
        letterSpacing: "0.12em",
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: "inherit", color: "#f0ece4" }}>LINZIDO</span>

      {mark && (
        /* Red circled ® — SVG gives exact stroke control independent of font size */
        <svg
          viewBox="0 0 100 100"
          aria-label="registered trademark"
          style={{
            width: "0.62em",
            height: "0.62em",
            marginLeft: "0.06em",
            flexShrink: 0,
            alignSelf: "center",
            marginBottom: "0.05em",
          }}
        >
          {/* Circle */}
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="#e53935"
            strokeWidth="9"
          />
          {/* R — drawn as two strokes: vertical stem + bowl + leg */}
          <path
            d="M33 24 h18 c10 0 16 6 16 14 c0 7-5 12-13 13 l14 25 h-10 L44 51 H42 v25 H33 Z
               M42 33 v11 h8 c5 0 8-2 8-6 s-3-5-8-5 Z"
            fill="#e53935"
          />
        </svg>
      )}
    </span>
  );
}
