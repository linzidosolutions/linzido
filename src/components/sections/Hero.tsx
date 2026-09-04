"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import AnimatedText from "@/components/ui/AnimatedText";
import MagneticButton from "@/components/ui/MagneticButton";
import { prefersReducedMotion } from "@/lib/utils";
import type { CompanySetting } from "@/payload-types";

/**
 * Flat-mode hero — the entry point for mobile, no-WebGL, and reduced-motion
 * visitors, who never see the 3D workshop scene. Without this they hit an
 * empty background for the full length of the (3D-only) scroll journey
 * before reaching any real content.
 */
export default function Hero({ ready, company }: { ready: boolean; company: CompanySetting }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion()) return;
    gsap.from(".hero-rise", {
      y: 52,
      opacity: 0,
      duration: 1.15,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.2,
    });
  }, [ready]);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] items-end overflow-hidden"
    >
      {/* Bottom-to-top veil — text legibility over the fixed background */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to top, #050505 0%, rgba(5,5,5,0.88) 28%, rgba(5,5,5,0.30) 62%, rgba(5,5,5,0.0) 100%)",
        }}
      />

      <div className="hero-copy container-x relative z-10 pb-20 pt-32">
        <div className="max-w-3xl">
          <div className="hero-rise mb-7 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-fg-dim">
                {company.name} · Available for new projects
              </span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-fg-faint">
              {company.tagline}
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.8rem,8vw,7rem)] font-medium leading-[0.9] tracking-[-0.04em]">
            <AnimatedText text="One team builds" trigger="mount" className="block" />
            <AnimatedText
              text="the website, the CRM,"
              trigger="mount"
              delay={0.12}
              className="block text-gradient"
            />
            <AnimatedText text="the automation, and the AI" trigger="mount" delay={0.24} className="block" />
            <AnimatedText
              text="so they actually work together."
              trigger="mount"
              delay={0.36}
              className="block"
            />
          </h1>

          <p className="hero-rise mt-7 max-w-xl text-base leading-relaxed text-fg-dim md:text-lg">
            {company.description}
          </p>

          <p className="hero-rise mt-4 max-w-xl text-sm leading-relaxed text-fg-faint md:text-base">
            Most of what slows a growing business down isn&apos;t a shortage of
            ideas — it&apos;s that the ideas only work if the same person does
            them the same way every time. We build the version that doesn&apos;t
            depend on that.
          </p>

          <div className="hero-rise mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton href="#work" variant="primary">
              See what we&apos;ve built
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>
            <MagneticButton href="#contact" variant="ghost">
              Book a Call
            </MagneticButton>
          </div>

          <div className="hero-rise mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-fg-faint">
            <span>Web Development</span>
            <span className="hidden h-1 w-1 rounded-full bg-fg-faint sm:block" />
            <span>Digital Marketing</span>
            <span className="hidden h-1 w-1 rounded-full bg-fg-faint sm:block" />
            <span>Automation</span>
            <span className="hidden h-1 w-1 rounded-full bg-fg-faint sm:block" />
            <span>CRM Development</span>
            <span className="hidden h-1 w-1 rounded-full bg-fg-faint sm:block" />
            <span>AI Solutions</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">
          Scroll
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
