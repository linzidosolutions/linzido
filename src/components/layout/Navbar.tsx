"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";
import { useMagnetic } from "@/hooks/useMagnetic";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { scrollToSection as scrollTo } from "@/lib/scrollTo";
import type { CompanySetting } from "@/payload-types";

function NavItem({ label, href }: { label: string; href: string }) {
  const ref = useMagnetic<HTMLButtonElement>(0.3);
  return (
    <button
      ref={ref}
      data-cursor="button"
      onClick={() => scrollTo(href)}
      className="group relative px-3 py-1.5 text-sm text-fg-dim transition-colors hover:text-white"
    >
      {label}
      <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
    </button>
  );
}

export default function Navbar({
  onOpenPalette,
  company,
}: {
  onOpenPalette: () => void;
  company: CompanySetting;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoRef = useMagnetic<HTMLButtonElement>(0.3);
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.4);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-close if the viewport grows into the desktop nav (e.g. device
  // rotation) so the mobile panel never gets stuck open behind it.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Scroll is driven by Lenis (see scrollTo.ts) — pause it while the mobile
  // panel covers the page so the page can't scroll underneath the overlay.
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } })
      .__lenis;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [mobileOpen]);

  const handleMobileNav = (href: string) => {
    setMobileOpen(false);
    // Let the panel visibly close before the page starts moving.
    setTimeout(() => scrollTo(href), 250);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex flex-col items-center px-4 pt-4">
      <nav
        className={cn(
          "flex w-full max-w-[var(--container)] items-center justify-between rounded-full px-3 py-2 transition-all duration-500",
          scrolled
            ? "glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]"
            : "border border-transparent"
        )}
      >
        <button
          ref={logoRef}
          data-cursor="button"
          onClick={() => scrollTo("#top")}
          className="pl-2"
          aria-label="Linzido — home"
        >
          <Logo className="text-2xl" />
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <NavItem key={l.href} {...l} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPalette}
            data-cursor="button"
            aria-label="Open command palette"
            className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-fg-faint transition-colors hover:text-white md:flex"
          >
            <span className="font-mono">⌘K</span>
          </button>
          <a
            ref={ctaRef}
            data-cursor="button"
            href={company.phone ? `tel:+${company.phone}` : "#contact"}
            onClick={
              company.phone
                ? undefined
                : (e) => {
                    e.preventDefault();
                    scrollTo("#contact");
                  }
            }
            className="btn btn-primary !px-5 !py-2.5 text-sm"
          >
            Book a Call
          </a>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            data-cursor="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-fg-dim transition-colors hover:text-white md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav-panel"
        className={cn(
          "w-full max-w-[var(--container)] overflow-hidden transition-all duration-300 ease-out md:hidden",
          mobileOpen ? "mt-2 max-h-96 opacity-100" : "pointer-events-none mt-0 max-h-0 opacity-0"
        )}
      >
        <div className="glass flex flex-col gap-1 rounded-3xl p-2">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              data-cursor="button"
              onClick={() => handleMobileNav(l.href)}
              className="rounded-2xl px-4 py-3 text-left text-base text-fg-dim transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
