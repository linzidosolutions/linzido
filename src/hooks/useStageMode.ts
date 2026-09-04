"use client";

import { useEffect, useState } from "react";

export type StageMode = "3d" | "flat";

const MIN_WIDTH = 768;

/** Cached — creating probe contexts is not free and the answer never changes. */
let webglSupport: boolean | null = null;

function supportsWebgl() {
  if (webglSupport !== null) return webglSupport;
  try {
    const c = document.createElement("canvas");
    webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

function resolve(): StageMode {
  if (typeof window === "undefined") return "flat";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "flat";
  if (window.innerWidth < MIN_WIDTH) return "flat";
  return supportsWebgl() ? "3d" : "flat";
}

/**
 * Decides whether the WebGL workshop should run.
 *
 * Starts as "flat" so server and first client render agree, then upgrades once
 * mounted. Re-evaluates on resize and when the reduced-motion preference
 * changes, so narrowing a window or toggling the OS setting takes effect
 * without a reload.
 */
export function useStageMode(): StageMode {
  const [mode, setMode] = useState<StageMode>("flat");

  useEffect(() => {
    let frame = 0;
    const update = () => setMode(resolve());

    update();

    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", onResize, { passive: true });
    motion.addEventListener("change", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      motion.removeEventListener("change", update);
    };
  }, []);

  return mode;
}
