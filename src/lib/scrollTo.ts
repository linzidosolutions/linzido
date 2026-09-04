"use client";

import type Lenis from "lenis";

/**
 * Scrolls to a #hash section. This site drives scroll through Lenis (see
 * SmoothScroll.tsx), which virtualizes the native scroll position — a plain
 * `scrollIntoView` gets fought and overridden on Lenis's next animation
 * frame, so any same-page anchor navigation must go through `lenis.scrollTo`
 * instead. Falls back to native smooth scroll if Lenis hasn't mounted yet.
 */
export function scrollToSection(
  href: string,
  options?: { offset?: number; duration?: number }
) {
  const el = document.querySelector(href);
  if (!el) return;

  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, {
      offset: options?.offset ?? -20,
      duration: options?.duration ?? 1.3,
    });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
