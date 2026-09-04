"use client";

import Marquee from "@/components/ui/Marquee";
import type { CompanySetting } from "@/payload-types";

type TechItem = NonNullable<CompanySetting["tech"]>[number];

/** Animated tech marquee — the toolset behind every build, admin-managed. */
export default function TechStack({ tech }: { tech: TechItem[] }) {
  if (tech.length === 0) return null;

  return (
    <section id="tech" className="section">
      <div className="container-x">
        <div className="flex items-center gap-3" data-reveal>
          <span className="h-px w-8 bg-accent" />
          <span className="eyebrow">Tech Stack</span>
        </div>
        <h2 className="mt-6 max-w-2xl font-display text-2xl font-medium text-fg-dim md:text-3xl" data-reveal>
          The modern toolkit powering every Linzido build —{" "}
          <span className="text-white">battle-tested, fast, and AI-native.</span>
        </h2>
      </div>

      <div className="mt-14 border-y border-line py-8">
        <Marquee speed={38}>
          {tech.map((t) => (
            <div
              key={t.id ?? t.value}
              className="group mx-4 flex items-center gap-4 md:mx-8"
            >
              <span className="font-display text-3xl font-medium text-white/35 transition-colors duration-300 group-hover:text-white md:text-5xl">
                {t.value}
              </span>
              <span className="text-2xl text-accent/50 md:text-4xl">✦</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
