/**
 * Coarse, one-shot capability check used only to scale 3D-scene *quality*
 * (particle counts, texture pixel ratio, decorative extras) — never whether
 * the 3D scene runs at all, which stays governed by useStageMode's
 * width/WebGL/reduced-motion gate. A "low" tier still gets the full scene,
 * just a cheaper version of it.
 */
let cached: boolean | null = null;

export function isLowEndDevice(): boolean {
  if (cached !== null) return cached;
  if (typeof navigator === "undefined") {
    cached = false;
    return cached;
  }

  const cores = navigator.hardwareConcurrency ?? 8;
  // deviceMemory is Chromium-only and not in TS's lib.dom types.
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
    ?.saveData;

  cached = cores <= 4 || memory <= 4 || Boolean(saveData);
  return cached;
}
