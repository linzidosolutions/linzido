"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap } from "@/lib/gsap";
import SectionHeading from "@/components/ui/SectionHeading";
import { prefersReducedMotion } from "@/lib/utils";
import type { CompanySetting, TeamMember } from "@/payload-types";

type Props = {
  timeline: NonNullable<CompanySetting["timeline"]>;
  company: CompanySetting;
  founders?: TeamMember[];
};

/**
 * About Linzido — the company, not the founders' full story (that lives in
 * the 3D scene's floating card, so the two don't repeat each other). This
 * section only credits the founders by photo + name, since flat-mode visitors
 * (mobile, reduced-motion, no WebGL) never see the 3D scene at all and would
 * otherwise get zero founder context anywhere on the site.
 */
export default function About({ timeline, company, founders }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const storyParagraphs = (company.story ?? "").split("\n\n").filter(Boolean);
  const metrics = company.metrics ?? [];
  const experience = metrics.find((m) => m.label.toLowerCase().includes("experience"));
  const businesses = metrics.find((m) => m.label.toLowerCase().includes("businesses"));

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(".tl-line-fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".tl-wrap",
          start: "top 70%",
          end: "bottom 75%",
          scrub: true,
        },
      });
      gsap.utils.toArray<HTMLElement>(".tl-node").forEach((node) => {
        gsap.from(node, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: node, start: "top 85%" },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" className="section" ref={ref}>
      <div className="container-x">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHeading eyebrow="About" title={`What ${company.name} is.`} />

              <p className="mt-8 max-w-md text-fg-dim" data-reveal>
                {company.description}
              </p>
              <div className="mt-10 flex gap-10" data-reveal>
                <div>
                  <p className="font-display text-4xl font-medium text-gradient">
                    {experience ? `${experience.value}${experience.suffix ?? ""}` : "6+"}
                  </p>
                  <p className="mt-1 text-sm text-fg-faint">{experience?.label ?? "Years building"}</p>
                </div>
                <div>
                  <p className="font-display text-4xl font-medium text-gradient">
                    {businesses ? `${businesses.value}${businesses.suffix ?? ""}` : "40+"}
                  </p>
                  <p className="mt-1 text-sm text-fg-faint">{businesses?.label ?? "Businesses helped"}</p>
                </div>
              </div>

              {founders && founders.length > 0 && (
                <div className="mt-10 flex flex-col gap-3" data-reveal>
                  {founders.map((f) => (
                    <div key={f.id} className="flex items-center gap-3">
                      <p className="text-sm text-fg-faint">
                        Built by <span className="text-fg-dim">{f.name}</span>, {f.role}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            {storyParagraphs.length > 0 && (
              <div className="mb-16 flex flex-col gap-5" data-reveal>
                {storyParagraphs.map((p, i) => (
                  <p key={i} className="max-w-2xl text-lg leading-relaxed text-fg-dim">
                    {p}
                  </p>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className="tl-wrap relative">
            <div className="absolute left-[11px] top-2 h-full w-px bg-line md:left-[15px]">
              <div className="tl-line-fill h-full w-full origin-top scale-y-0 bg-gradient-to-b from-accent to-accent/10" />
            </div>
            <div className="flex flex-col gap-12">
              {timeline.map((item) => (
                <div key={item.id ?? item.year} className="tl-node relative pl-12 md:pl-16">
                  <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg md:h-8 md:w-8">
                    <span className="h-2 w-2 rounded-full bg-accent md:h-2.5 md:w-2.5" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">
                    {item.year}
                  </span>
                  <h3 className="mt-2 font-display text-2xl font-medium md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-md text-fg-dim">{item.body}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
