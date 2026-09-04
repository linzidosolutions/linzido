"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Two-layer cursor: a small solid dot that tracks 1:1 and a larger ring
 * that eases behind it. Hovering elements with [data-cursor] morphs the
 * ring (grows, shows a label, or highlights links). Hidden on touch and
 * reduced-motion. The DOM nodes always render so refs are valid the first
 * time the effect runs — we only toggle visibility via `enabled`.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    setEnabled(true);
    document.documentElement.classList.add("cursor-none");

    const xDot = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      if (!target) return;
      const type = target.dataset.cursor;
      if (type === "button" || target.tagName === "A" || target.tagName === "BUTTON") {
        gsap.to(ring, { scale: 1.8, borderColor: "rgba(77,109,255,0.9)", duration: 0.3 });
      } else if (type === "view") {
        setLabel(target.dataset.cursorLabel || "View");
        gsap.to(ring, { scale: 3.6, backgroundColor: "rgba(77,109,255,0.9)", borderColor: "transparent", duration: 0.3 });
        gsap.to(dot, { opacity: 0, duration: 0.2 });
      } else {
        gsap.to(ring, { scale: 1.5, duration: 0.3 });
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      if (!target) return;
      setLabel("");
      gsap.to(ring, { scale: 1, backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.4)", duration: 0.3 });
      gsap.to(dot, { opacity: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.documentElement.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div style={{ opacity: enabled ? 1 : 0 }} aria-hidden>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
        style={{ borderColor: "rgba(255,255,255,0.4)" }}
      >
        {label && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-white">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
