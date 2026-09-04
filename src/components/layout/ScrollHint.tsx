"use client";

import { useEffect, useRef } from "react";
import { workshopState } from "@/lib/workshopState";

/**
 * "Scroll to enter" — a first-load nudge for the 3D journey, gone the
 * moment scrolling actually starts. Reads workshopState.progress directly
 * via rAF (same pattern as the cursor-style toggle in WorkshopStage)
 * rather than React state, so it doesn't trigger a re-render every frame.
 */
export default function ScrollHint() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (ref.current) {
        // Fully visible at progress 0, gone by 0.03 — just enough scroll to
        // register as "they've started" before it steps out of the way.
        const opacity = Math.max(0, 1 - workshopState.progress / 0.03);
        ref.current.style.opacity = String(opacity);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed bottom-10 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 text-[#ff3b30]"
      style={{ textShadow: "0 0 20px rgba(255,59,48,0.6)" }}
    >
      {/* Blink lives on this inner span, not the outer ref'd div — that
          div's opacity is already driven imperatively every frame by the
          scroll-fade loop above, which would fight a CSS animation on the
          same property. Nesting them multiplies correctly instead. */}
      <span
        className="font-mono text-xs font-bold uppercase tracking-[0.3em]"
        style={{ animation: "blink 2.5s ease-in-out infinite" }}
      >
        Scroll to enter
      </span>
      <svg
        className="h-4 w-4 animate-bounce"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3v10M3 9l5 5 5-5" />
      </svg>
    </div>
  );
}
