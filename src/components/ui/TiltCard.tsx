"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion, cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
};

/**
 * 3D tilt on pointer move with an optional light-glare that tracks the
 * cursor. Uses transform-style: preserve-3d so nested layers can lift.
 */
export default function TiltCard({ children, className, max = 8, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    gsap.to(el, {
      rotateY: (px - 0.5) * max * 2,
      rotateX: -(py - 0.5) * max * 2,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 900,
    });
    if (glare && glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 1,
        background: `radial-gradient(320px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.14), transparent 60%)`,
        duration: 0.4,
      });
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" });
    if (glareRef.current) gsap.to(glareRef.current, { opacity: 0, duration: 0.4 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("relative", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
        />
      )}
    </div>
  );
}
