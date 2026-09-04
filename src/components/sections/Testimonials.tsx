"use client";

import Marquee from "@/components/ui/Marquee";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/payload-types";

function Card({ quote, name, title }: { quote: string; name: string; title: string }) {
  return (
    <figure className="glass mx-3 flex w-[86vw] max-w-[420px] flex-col justify-between gap-6 rounded-3xl p-7">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden className="text-accent">
        <path d="M10 8H6a2 2 0 00-2 2v6h6v-6M20 8h-4a2 2 0 00-2 2v6h6v-6" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <blockquote className="text-lg leading-relaxed text-white/90">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#7c5cff] font-display text-sm font-medium">
          {name.split(" ").map((n) => n[0]).join("")}
        </span>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-fg-faint">{title}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** Infinite testimonial marquee, admin-managed via the Testimonials collection. */
export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  const half = Math.ceil(testimonials.length / 2);
  const rowA = testimonials.slice(0, half);
  const rowB = testimonials.slice(half).concat(testimonials.slice(0, 1));

  return (
    <section id="testimonials" className="section overflow-hidden">
      <div className="container-x">
        <SectionHeading eyebrow="Testimonials" title="Trusted by founders who ship." align="center" className="mx-auto" />
      </div>

      <div className="mt-16 flex flex-col gap-6">
        <Marquee speed={46} pauseOnHover>
          {rowA.map((t) => (
            <Card key={t.id} {...t} />
          ))}
        </Marquee>
        {rowB.length > 0 && (
          <Marquee speed={52} reverse pauseOnHover>
            {rowB.map((t, i) => (
              <Card key={`${t.id}-${i}`} {...t} />
            ))}
          </Marquee>
        )}
      </div>
    </section>
  );
}
