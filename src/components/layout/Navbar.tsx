"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";
import { useMagnetic } from "@/hooks/useMagnetic";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { scrollToSection as scrollTo } from "@/lib/scrollTo";

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

export default function Navbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const logoRef = useMagnetic<HTMLButtonElement>(0.3);
  const ctaRef = useMagnetic<HTMLButtonElement>(0.4);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4">
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
            className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-fg-faint transition-colors hover:text-white sm:flex"
          >
            <span className="font-mono">⌘K</span>
          </button>
          <button
            ref={ctaRef}
            data-cursor="button"
            onClick={() => scrollTo("#contact")}
            className="btn btn-primary !px-5 !py-2.5 text-sm"
          >
            Book a Call
          </button>
        </div>
      </nav>
    </header>
  );
}
