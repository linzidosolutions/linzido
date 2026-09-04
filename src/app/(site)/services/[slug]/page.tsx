import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServices, getServiceBySlug, getFaqs } from "@/lib/payload-data";
import { jsonLdScript } from "@/lib/utils";
import RevealOnMount from "@/components/layout/RevealOnMount";

type Params = { slug: string };

const SITE_URL = "https://linzido.com";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Not found" };

  return {
    title: service.seo?.title || service.title,
    description: service.seo?.description || service.shortDesc,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      type: "website",
      title: service.title,
      description: service.shortDesc,
      url: `${SITE_URL}/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [allServices, faqs] = await Promise.all([getServices(), getFaqs(service.id)]);
  const others = allServices.filter((s) => s.slug !== service.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDesc,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { "@type": "Organization", name: "Linzido" },
  };

  const faqJsonLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: service.title, item: `${SITE_URL}/services/${service.slug}` },
    ],
  };

  return (
    <main className="relative">
      <RevealOnMount />

      {/* Hero */}
      <section className="container-x pb-16 pt-32 md:pt-40">
        <Link
          href="/services"
          className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-white"
        >
          ← All services
        </Link>

        <header className="mt-10 max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="eyebrow">{service.heroEyebrow || "Service"}</span>
          </div>
          <h1 className="display-lg">{service.heroTitle}</h1>
          {service.heroSubtitle && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-dim">
              {service.heroSubtitle}
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-2">
            {(service.tags ?? []).map((t) => (
              <span
                key={t.id ?? t.value}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg-faint"
              >
                {t.value}
              </span>
            ))}
          </div>
        </header>
      </section>

      {/* Who it's for / why Linzido */}
      {(service.idealFor || service.differentiator) && (
        <section className="section pt-0">
          <div className="container-x">
            <div className="grid grid-cols-1 gap-8 rounded-3xl border border-line bg-surface p-8 md:grid-cols-2 md:p-10">
              {service.idealFor && (
                <div data-reveal>
                  <h2 className="eyebrow mb-3">Who this is for</h2>
                  <p className="text-lg leading-relaxed text-fg-dim">{service.idealFor}</p>
                </div>
              )}
              {service.differentiator && (
                <div data-reveal>
                  <h2 className="eyebrow mb-3">Why Linzido</h2>
                  <p className="text-lg leading-relaxed text-fg-dim">{service.differentiator}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Sub-services / offerings */}
      {service.subServices.length > 0 && (
        <section className="section pt-0">
          <div className="container-x">
            <div className="mb-4 flex items-center gap-3" data-reveal>
              <span className="h-px w-8 bg-accent" />
              <span className="eyebrow">What&apos;s included</span>
            </div>
            <h2 className="display-md max-w-xl" data-reveal>
              {service.subServices.length} ways we help with {service.title.toLowerCase()}.
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
              {service.subServices.map((sub, i) => (
                <article
                  key={sub.id}
                  data-reveal
                  data-reveal-delay={(i % 2) * 80}
                  className="glass flex flex-col gap-4 rounded-3xl p-7"
                >
                  <div>
                    <span className="font-mono text-xs text-fg-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-medium">{sub.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-dim">{sub.desc}</p>
                  </div>
                  {(sub.problem || sub.value) && (
                    <p className="text-sm leading-relaxed text-fg-faint">
                      {[sub.problem, sub.value].filter(Boolean).join(" ")}
                    </p>
                  )}
                  {(sub.features?.length ?? 0) > 0 && (
                    <ul className="flex flex-col gap-2 border-t border-line pt-4">
                      {sub.features!.map((f) => (
                        <li key={f.id ?? f.value} className="flex gap-2 text-sm text-fg-dim">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                          {f.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sub.outcome && (
                    <p className="mt-auto border-t border-line pt-4 text-sm text-fg-dim">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                        What you get —{" "}
                      </span>
                      {sub.outcome}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section pt-0">
          <div className="container-x max-w-3xl">
            <div className="mb-4 flex items-center gap-3" data-reveal>
              <span className="h-px w-8 bg-accent" />
              <span className="eyebrow">FAQ</span>
            </div>
            <h2 className="display-md" data-reveal>
              Common questions.
            </h2>
            <div className="mt-10 flex flex-col divide-y divide-line border-y border-line">
              {faqs.map((f) => (
                <details key={f.id} className="group py-6" data-reveal>
                  <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-medium">
                    {f.question}
                    <span className="ml-4 shrink-0 text-fg-faint transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-fg-dim">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-x text-center">
          <h2 className="display-md" data-reveal>
            Ready to get started with {service.title.toLowerCase()}?
          </h2>
          <div className="mt-9 flex justify-center" data-reveal>
            <Link href="/#contact" className="btn btn-primary">
              Book a call
            </Link>
          </div>
        </div>
      </section>

      {/* Other services */}
      {others.length > 0 && (
        <section className="border-t border-line py-14">
          <div className="container-x">
            <p className="eyebrow mb-6" data-reveal>
              Other services
            </p>
            <div className="flex flex-wrap gap-3" data-reveal>
              {others.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="rounded-full border border-line px-4 py-2 text-sm text-fg-dim transition-colors hover:border-white hover:text-white"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
    </main>
  );
}
