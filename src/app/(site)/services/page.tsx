import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/payload-data";
import { jsonLdScript } from "@/lib/utils";
import RevealOnMount from "@/components/layout/RevealOnMount";

const SITE_URL = "https://linzido.com";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website, CRM, automation, and AI systems — engineered by one team so growth doesn't depend on five vendors talking to each other.",
  alternates: { canonical: "/services" },
};

export default async function ServicesIndex() {
  const services = await getServices();

  return (
    <main className="relative">
      <RevealOnMount />
      <div className="container-x pb-24 pt-32 md:pt-40">
        <Link
          href="/"
          className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-white"
        >
          ← Home
        </Link>

        <header className="mt-10 max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="eyebrow">Services</span>
          </div>
          <h1 className="display-lg">Five disciplines. One system.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-dim">
            One team across the website, the CRM, the automation, and the AI —
            not five vendors stitched together. Pick a discipline to see
            exactly what&apos;s included.
          </p>
        </header>

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
                <h2 className="font-display text-2xl font-medium transition-transform duration-500 group-hover:-translate-y-0.5">
                  {s.title}
                </h2>
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
                {s.subServices.length > 0 && (
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-fg-faint">
                    {s.subServices.length} offerings inside →
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 flex justify-center" data-reveal>
          <Link href="/#contact" className="btn btn-primary">
            Start a project
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/services/${s.slug}`,
              name: s.title,
            })),
          }),
        }}
      />
    </main>
  );
}
