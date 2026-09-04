"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/ui/TiltCard";
import { projectCoverUrl } from "@/lib/media";
import { ScrollTrigger } from "@/lib/gsap";
import type { Project } from "@/payload-types";

// Reaching this section at all means the page has already scrolled through
// (and past) the 3D scene's 10,000px GSAP-pinned journey. Killing every
// ScrollTrigger synchronously, before Next's router starts the route change,
// prevents that pin's teardown from racing React's own unmount of the 3D
// scene — a race that otherwise flashes a tall empty gap at the top of the
// case-study page while the layout catches up.
function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/**
 * Featured work as large asymmetric cards. Each has a generative gradient
 * "cover" (drop in real thumbnails later), tilt on hover, and an expanding
 * detail strip. First card spans two columns for editorial rhythm.
 */
export default function Work({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section id="work" className="section">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionHeading eyebrow="Selected Work" title="Systems that shipped and scaled." />
            <p className="mt-6 max-w-md text-fg-dim" data-reveal>
              Every one of these replaced something that used to depend on a
              person doing it the same way twice.
            </p>
          </div>
          <span className="font-mono text-sm text-fg-faint" data-reveal>
            ({String(projects.length).padStart(2, "0")}) projects
          </span>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((p, i) => {
            const wide = i === 0;
            const isActive = active === p.slug;
            const hasCaseStudy = Boolean(p.study?.problem && p.study?.approach);
            const cover = projectCoverUrl(p);
            return (
              <div
                key={p.slug}
                data-reveal
                data-reveal-delay={(i % 2) * 90}
                className={wide ? "md:col-span-2" : ""}
                onMouseEnter={() => setActive(p.slug)}
                onMouseLeave={() => setActive(null)}
              >
                <TiltCard max={5} className="h-full">
                  <Link
                    href={hasCaseStudy ? `/work/${p.slug}` : "#contact"}
                    onClick={hasCaseStudy ? killScrollTriggers : undefined}
                    data-cursor="view"
                    data-cursor-label={hasCaseStudy ? "Read" : "View"}
                    aria-label={
                      hasCaseStudy
                        ? `Read the ${p.title} case study`
                        : `Enquire about ${p.title}`
                    }
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface"
                  >
                    {/* cover — real screenshot when one exists, generative gradient otherwise */}
                    <div
                      className={`relative overflow-hidden ${wide ? "aspect-[21/9]" : "aspect-[16/10]"}`}
                    >
                      {cover ? (
                        <Image
                          src={cover}
                          alt={`${p.title} — ${p.category}`}
                          fill
                          sizes={wide ? "(max-width: 768px) 100vw, 1320px" : "(max-width: 768px) 100vw, 660px"}
                          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                        />
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                            style={{
                              background: `radial-gradient(120% 120% at 20% 10%, ${p.accent}44, transparent 55%), radial-gradient(120% 120% at 90% 90%, ${p.accent}22, transparent 60%), #0c0c12`,
                            }}
                          />
                          {/* mesh lines */}
                          <div
                            className="absolute inset-0 opacity-40"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                              backgroundSize: "44px 44px",
                              maskImage: "radial-gradient(120% 120% at 50% 20%, #000 40%, transparent 75%)",
                            }}
                          />
                          <span
                            className="absolute left-6 top-6 font-display text-[clamp(2rem,6vw,4.5rem)] font-medium leading-none text-white/90 mix-blend-overlay"
                          >
                            {p.title}
                          </span>
                        </>
                      )}
                      <span className="absolute right-6 top-6 font-mono text-xs text-white/60">
                        {p.year}
                      </span>
                    </div>

                    {/* meta */}
                    <div className="flex flex-1 flex-col justify-between gap-6 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-xl font-medium">{p.title}</h3>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-accent">
                            {p.category}
                          </p>
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-fg-dim transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M4 12L12 4M12 4H5M12 4v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>

                      <div
                        className="grid transition-all duration-500 ease-out"
                        style={{
                          gridTemplateRows: isActive ? "1fr" : "0fr",
                          opacity: isActive ? 1 : 0,
                        }}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-4 text-sm text-fg-dim">{p.desc}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(p.stack ?? []).map((t) => (
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
                </TiltCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
