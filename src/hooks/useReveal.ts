"use client";

import { useEffect } from "react";

/**
 * Lightweight scroll-reveal. Any element with [data-reveal] gets
 * data-inview="true" when it enters the viewport, driving the CSS
 * blur/translate transition defined in globals.css. Honors reduced motion
 * automatically (CSS forces visible state).
 *
 * Supports [data-reveal-delay="120"] (ms) for staggering.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay;
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.dataset.inview = "true";
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
