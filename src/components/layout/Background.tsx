"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/utils";

/**
 * Fixed, full-viewport atmosphere behind all content:
 *  - drifting gradient orbs (CSS)
 *  - a canvas particle field with soft parallax toward the cursor
 *  - a cursor-following spotlight
 *  - an SVG grain overlay
 * All layers are pointer-events:none and reduced-motion aware.
 */
export default function Background({ particles = true }: { particles?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const mouse = { x: 0.5, y: 0.5 };
    type P = { x: number; y: number; z: number; r: number; tw: number };
    let field: P[] = [];

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      const count = Math.min(120, Math.floor((w * h) / 14000));
      field = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const ox = (mouse.x - 0.5) * 40;
      const oy = (mouse.y - 0.5) * 40;
      for (const p of field) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.001 + p.tw);
        const x = p.x + ox * p.z;
        const y = p.y + oy * p.z;
        ctx.beginPath();
        ctx.arc(x, y, p.r * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${180 + p.z * 40},${190 + p.z * 40},255,${0.05 + tw * 0.35 * p.z})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    build();
    if (!reduced) raf = requestAnimationFrame(draw);
    else {
      // one static frame
      draw(0);
      cancelAnimationFrame(raf);
    }

    const onResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      build();
    };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
      if (spotRef.current) {
        spotRef.current.style.setProperty("--mx", `${e.clientX}px`);
        spotRef.current.style.setProperty("--my", `${e.clientY}px`);
      }
    };
    // The loop otherwise runs forever, including in a backgrounded tab —
    // pure wasted CPU/battery with nothing on screen to show for it.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [particles]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* base wash */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* drifting orbs */}
      <div
        className="absolute -left-[15%] top-[-10%] h-[55vw] w-[55vw] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(196,26,46,0.18), transparent 62%)",
          animation: "drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-15%] top-[35%] h-[48vw] w-[48vw] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(77,109,255,0.12), transparent 62%)",
          animation: "drift-2 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[25%] h-[40vw] w-[40vw] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(150,20,35,0.10), transparent 60%)",
          animation: "drift 30s ease-in-out infinite",
        }}
      />

      {/* particles — suppressed while the WebGL workshop is running, which
          renders its own particle field directly in front of this one */}
      {particles && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}

      {/* cursor spotlight */}
      <div
        ref={spotRef}
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgba(196,26,46,0.07), transparent 60%)",
        }}
      />

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          animation: "grain 8s steps(6) infinite",
        }}
      />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
