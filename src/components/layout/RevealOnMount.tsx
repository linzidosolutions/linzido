"use client";

import { useReveal } from "@/hooks/useReveal";

/** Activates [data-reveal] scroll animations on pages outside <Experience>. */
export default function RevealOnMount() {
  useReveal();
  return null;
}
