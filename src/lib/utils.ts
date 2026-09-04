export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** clamp a number between min and max */
export function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

/**
 * JSON.stringify for a <script type="application/ld+json"> body. Plain
 * JSON.stringify doesn't escape "<", so admin-entered content (a project
 * description, an FAQ answer) containing the literal text "</script>" would
 * close the tag early and let whatever follows execute as HTML/script. All
 * of this data is already admin-only-writable, but the fix is free, so
 * there's no reason not to have it.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Formats a digits-only international phone number (e.g. "923238579399",
 * as stored in Company Settings) for display — "+92 323 8579399" for a
 * Pakistani mobile number. Falls back to a plain "+"-prefixed string for
 * any other length/format rather than guessing at unfamiliar groupings.
 */
export function formatPhone(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (clean.startsWith("92") && clean.length === 12) {
    return `+92 ${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  return `+${clean}`;
}
