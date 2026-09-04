/**
 * Mutable singleton shared between the DOM scroll handler and the R3F useFrame
 * loop. Plain object — no React, no re-renders, no per-frame allocation.
 *
 * The journey is expressed as a single 0→1 progress value over the whole page
 * rather than discrete per-section phases, because the scene is authored as one
 * continuous camera move with scene boundaries at fixed percentages.
 */
export const workshopState = {
  /** 0→1 down the page. Written by the scroll handler. */
  targetProgress: 0,
  /** Smoothed toward targetProgress each frame; this is what the scene reads. */
  progress: 0,
  /** Raw pointer position, normalised to -0.5…0.5. Written by mousemove. */
  pointerX: 0,
  pointerY: 0,
  /** Lag-smoothed pointer — used by camera look-around and panel proximity. */
  smoothX: 0,
  smoothY: 0,
  /** Index into PROJECTS of the card nearest the pointer in the vault. -1 outside vault. */
  hoveredProjectIdx: -1,
  /** Index (0-3) of the Developer Room panel nearest the pointer. -1 outside that section. */
  hoveredRoomPanelIdx: -1,
  /** Index (0-3) of the Marketing Centre panel nearest the pointer. -1 outside that section. */
  hoveredMarketingPanelIdx: -1,
};

/** Scene boundaries as page-scroll fractions, exactly as authored in the brief. */
export const SCENES = {
  arrival: [0.0, 0.1],
  approach: [0.1, 0.2],
  shoulder: [0.2, 0.3],
  enterScreen: [0.3, 0.4],
  devRoom: [0.4, 0.55],
  marketing: [0.55, 0.7],
  aiLab: [0.7, 0.85],
  vault: [0.85, 0.92],
  backToReality: [0.92, 0.95],
  creator: [0.95, 0.98],
  yourTurn: [0.98, 1.0],
} as const;

/** Normalised 0→1 position within a scene, clamped outside it. */
export function sceneT(progress: number, range: readonly [number, number]) {
  return Math.max(0, Math.min(1, (progress - range[0]) / (range[1] - range[0])));
}

/** Smoothstep — used everywhere so scene transitions ease rather than snap. */
export function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
