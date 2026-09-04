/**
 * Structural navigation config — not admin-managed content. Everything
 * editorial (company info, services, projects, testimonials, etc.) now
 * lives in Payload; see src/lib/payload-data.ts.
 */

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
] as const;
