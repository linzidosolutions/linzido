"use client";

import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import type { ServiceWithSubServices } from "@/lib/payload-data";

/** Editorial services grid with hover glow, index numbering and reveal-in tags. */
export default function Services({ services }: { services: ServiceWithSubServices[] }) {
  return (
    <section id="services" className="section">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Services" title="Five disciplines. One system." />
          <p className="max-w-sm text-fg-dim md:text-right" data-reveal>
            One team, not five vendors — the website, the CRM, the automation,
            and the AI all built by the same people, to the same standard.
            Change one and the others don&apos;t quietly break.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              data-reveal
              data-reveal-delay={(i % 3) * 80}
              data-cursor="view"
              data-cursor-label="Explore"
              className="group glow-border relative flex flex-col justify-between gap-10 bg-bg p-7 transition-colors duration-500 hover:bg-surface"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-fg-faint">{s.displayIndex}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg-faint transition-all duration-500 group-hover:border-accent group-hover:text-accent">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="transition-transform duration-500 group-hover:rotate-45">
                    <path d="M4 12L12 4M12 4H5M12 4v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-medium transition-transform duration-500 group-hover:-translate-y-0.5">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-dim">{s.shortDesc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(s.tags ?? []).map((t) => (
                    <span
                      key={t.id ?? t.value}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg-faint"
                    >
                      {t.value}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
