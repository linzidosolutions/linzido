"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/site";
import { scrollToSection as go } from "@/lib/scrollTo";
import type { CompanySetting, Service } from "@/payload-types";

type Cmd = { label: string; hint: string; action: () => void };

/**
 * ⌘K / Ctrl+K command palette for fast navigation and contact actions.
 * Fully keyboard driven with arrow + enter, Esc to close.
 */
export default function CommandPalette({
  open,
  setOpen,
  services,
  company,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  services: Service[];
  company: CompanySetting;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const commands: Cmd[] = useMemo(() => {
    const nav = NAV_LINKS.map((l) => ({
      label: `Go to ${l.label}`,
      hint: "Navigate",
      action: () => go(l.href),
    }));
    const svc = services.slice(0, 6).map((s) => ({
      label: s.title,
      hint: "Service",
      action: () => (window.location.href = `/services/${s.slug}`),
    }));
    const activeSocials = (company.socials ?? []).filter((s) => Boolean(s.href));
    const contact: Cmd[] = [
      { label: "Email Us", hint: "Contact", action: () => (window.location.href = `mailto:${company.email}`) },
      { label: "Book a Call", hint: "Contact", action: () => go("#contact") },
      ...activeSocials.map((s) => ({
        label: s.label,
        hint: "Social",
        action: () => window.open(s.href as string, "_blank"),
      })),
    ];
    return [...nav, ...contact, ...svc];
  }, [services, company]);

  const filtered = useMemo(
    () =>
      commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      ),
    [commands, query]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === "Enter" && filtered[active]) {
        filtered[active].action();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active, setOpen]);

  // Reset query/active when `open` flips true. Adjusted during render (React's
  // recommended pattern for this) rather than in an effect, since it only
  // needs to run exactly when `open` changes, not on every render after.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActive(0);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-start justify-center px-4 pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Type a command or search…"
              className="w-full bg-transparent px-5 py-4 text-base text-white outline-none placeholder:text-fg-faint"
            />
            <div className="max-h-[46vh] overflow-y-auto border-t border-line p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-fg-faint">No results</p>
              )}
              {filtered.map((c, i) => (
                <button
                  key={c.label}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    c.action();
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active === i ? "bg-white/8 text-white" : "text-fg-dim"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                    {c.hint}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[10px] text-fg-faint">
              <span>↑↓ navigate · ↵ select</span>
              <span>ESC close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
