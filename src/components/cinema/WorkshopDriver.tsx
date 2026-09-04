"use client";

import { useEffect, useRef } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import { workshopState } from "@/lib/workshopState";

/* ─────────────────────────────────────────────────────────────────────────────
   WorkshopDriver
   An invisible full-viewport div pinned by GSAP ScrollTrigger.
   Its onUpdate callback sets workshopState.targetProgress (0 → 1),
   which the fixed R3F canvas (WorkshopStage) reads each frame to advance
   the 11-scene 3D journey.

   Sits in the document flow immediately after VideoJourney, so the 3D
   environments begin exactly where the video ends.
   ───────────────────────────────────────────────────────────────────────────── */

/** Total scroll depth in px for the entire 3D journey (all 11 scenes). */
const DEPTH = 10_000;

export default function WorkshopDriver() {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();

    const st = ScrollTrigger.create({
      trigger: triggerRef.current,
      start: "top top",
      end: `+=${DEPTH}`,
      pin: true,
      pinSpacing: true,
      onUpdate(self) {
        workshopState.targetProgress = self.progress;
      },
      onLeave() {
        // Hard snap, not just the target — the eased `progress` normally
        // catches up over roughly a second, and a fast scroll/fling can
        // carry the page well into the About/Services/Process sections
        // before that catch-up finishes. Those sections aren't fully
        // opaque (by design, to glimpse the ambient background), so the
        // still-mid-transition 3D scene — e.g. the Marketing Centre's
        // dashboard panel — was visibly bleeding through the content
        // underneath it. Once genuinely scrolled past the pin there's no
        // cinematic reason left to ease; jump straight to the resting state.
        workshopState.targetProgress = 1;
        workshopState.progress = 1;
      },
      onEnterBack() {
        workshopState.targetProgress = 1;
        workshopState.progress = 1;
      },
    });

    return () => st.kill();
  }, []);

  return (
    <div
      ref={triggerRef}
      style={{ height: "100vh", position: "relative" }}
      aria-hidden="true"
    />
  );
}
