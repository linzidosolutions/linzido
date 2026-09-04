"use client";

import Counter from "@/components/ui/Counter";
import type { CompanySetting } from "@/payload-types";

type Metric = NonNullable<CompanySetting["metrics"]>[number];

/** Animated counters — proof in numbers, admin-managed via Company Settings. */
export default function Metrics({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;

  return (
    <section id="metrics" className="section">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
          {metrics.map((m, i) => (
            <div
              key={m.id ?? m.label}
              data-reveal
              data-reveal-delay={i * 90}
              className="bg-bg p-8 md:p-10"
            >
              <p className="font-display text-5xl font-medium tracking-tight md:text-7xl">
                <span className="text-gradient">
                  <Counter value={m.value} suffix={m.suffix ?? ""} />
                </span>
              </p>
              <p className="mt-3 text-sm text-fg-dim">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
