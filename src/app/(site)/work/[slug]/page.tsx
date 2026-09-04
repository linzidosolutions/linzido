import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProjects, mediaUrl, projectCoverUrl } from "@/lib/payload-data";
import { jsonLdScript } from "@/lib/utils";
import ImageSlider from "@/components/ui/ImageSlider";

type Params = { slug: string };

const SITE_URL = "https://linzido.com";

function hasCaseStudy(p: Awaited<ReturnType<typeof getProjects>>[number]) {
  return Boolean(p.study?.problem && p.study?.approach);
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.filter(hasCaseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Not found" };

  const cover = projectCoverUrl(project);
  // The layout's title template appends " · Linzido" — skip it for the one
  // case study that happens to share the company's own name, so the tab
  // doesn't read "Linzido — Studio / Brand · Linzido".
  const isCompanyNamedProject = project.title.trim().toLowerCase() === "linzido";

  return {
    title: isCompanyNamedProject
      ? { absolute: `${project.title} — ${project.category}` }
      : `${project.title} — ${project.category}`,
    description: project.desc,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — ${project.category}`,
      description: project.desc,
      url: `${SITE_URL}/work/${project.slug}`,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function CaseStudy({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project || !hasCaseStudy(project)) notFound();

  const study = project.study!;
  const caseStudies = projects.filter(hasCaseStudy);
  const index = caseStudies.findIndex((p) => p.slug === project.slug);
  const next = caseStudies[index + 1] ?? caseStudies.find((p) => p.slug !== project.slug);
  const cover = projectCoverUrl(project);
  const stack = project.stack ?? [];
  const highlights = study.highlights ?? [];
  const outcomes = study.outcomes ?? [];
  const gallery = (project.gallery ?? [])
    .map((g) => ({
      src: mediaUrl(g.image),
      // Prefer the real, specific alt text set on the upload itself (e.g.
      // "Civil Tracker — dashboard overview") over a generic fallback.
      alt:
        (typeof g.image === "object" ? g.image?.alt : undefined) ||
        `${project.title} — product screenshot`,
    }))
    .filter((g): g is { src: string; alt: string } => Boolean(g.src));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.desc,
    url: `${SITE_URL}/work/${project.slug}`,
    dateCreated: project.year,
    creator: { "@type": "Organization", name: "Linzido" },
    keywords: stack.map((t) => t.value).join(", "),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/#work` },
      { "@type": "ListItem", position: 3, name: project.title, item: `${SITE_URL}/work/${project.slug}` },
    ],
  };

  return (
    <main className="relative">
      <div className="container-x pb-24 pt-32 md:pt-40">
        <Link
          href="/#work"
          className="eyebrow inline-flex items-center gap-2 transition-colors hover:text-white"
        >
          ← All work
        </Link>

        <header className="mt-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: project.accent }}
            >
              {project.category}
            </span>
            <span className="h-1 w-1 rounded-full bg-fg-faint" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-fg-faint">
              {project.year}
            </span>
          </div>
          <h1 className="display-lg mt-5">{project.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-dim">
            {project.desc}
          </p>
        </header>

        {/* Cover / screenshots */}
        {gallery.length > 0 ? (
          <div className="mt-14">
            <ImageSlider slides={gallery} />
          </div>
        ) : (
          <div
            className="relative mt-14 aspect-[21/9] overflow-hidden rounded-3xl border border-line"
            style={
              cover
                ? undefined
                : {
                    background: `radial-gradient(120% 120% at 20% 10%, ${project.accent}44, transparent 55%), radial-gradient(120% 120% at 90% 90%, ${project.accent}22, transparent 60%), #0c0c12`,
                  }
            }
          >
            {cover && (
              <Image
                src={cover}
                alt={`${project.title} — project cover`}
                fill
                sizes="(max-width: 1320px) 100vw, 1320px"
                className="object-cover"
                priority
              />
            )}
          </div>
        )}

        {/* Body */}
        <div className="mt-20 grid grid-cols-1 gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <dl className="flex flex-col gap-8">
              {study.role && (
                <div>
                  <dt className="eyebrow mb-2">Role</dt>
                  <dd className="text-fg-dim">{study.role}</dd>
                </div>
              )}
              <div>
                <dt className="eyebrow mb-2">Stack</dt>
                <dd className="flex flex-wrap gap-2">
                  {stack.map((t) => (
                    <span
                      key={t.id ?? t.value}
                      className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg-faint"
                    >
                      {t.value}
                    </span>
                  ))}
                </dd>
              </div>
              {project.liveUrl && (
                <div>
                  <dt className="eyebrow mb-2">Live</dt>
                  <dd>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-dim underline decoration-line underline-offset-4 transition-colors hover:text-white"
                    >
                      Visit site ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </aside>

          <div className="flex flex-col gap-12 lg:col-span-8">
            {study.context && (
              <section>
                <h2 className="display-md mb-5">The context</h2>
                <p className="text-lg leading-relaxed text-fg-dim">{study.context}</p>
              </section>
            )}
            <section>
              <h2 className="display-md mb-5">The problem</h2>
              <p className="text-lg leading-relaxed text-fg-dim">{study.problem}</p>
            </section>
            <section>
              <h2 className="display-md mb-5">The approach</h2>
              <p className="text-lg leading-relaxed text-fg-dim">{study.approach}</p>
            </section>
            {study.solution && (
              <section>
                <h2 className="display-md mb-5">The solution</h2>
                <p className="text-lg leading-relaxed text-fg-dim">{study.solution}</p>
              </section>
            )}
            {highlights.length > 0 && (
              <section>
                <h2 className="display-md mb-5">Highlights</h2>
                <ul className="flex flex-col gap-3">
                  {highlights.map((h) => (
                    <li key={h.id ?? h.value} className="flex gap-3 text-lg text-fg-dim">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {h.value}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {outcomes.length > 0 && (
              <section>
                <h2 className="display-md mb-5">The result</h2>
                <ul className="flex flex-col gap-3">
                  {outcomes.map((o) => (
                    <li key={o.id ?? o.value} className="flex gap-3 text-lg text-fg-dim">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {o.value}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Next project + CTA */}
        <nav className="mt-28 flex flex-col gap-6 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          {next && (
            <Link href={`/work/${next.slug}`} className="group">
              <span className="eyebrow">Next project</span>
              <span className="mt-2 block font-display text-2xl font-medium transition-colors group-hover:text-accent">
                {next.title} →
              </span>
            </Link>
          )}
          <Link href="/#contact" className="btn btn-primary self-start sm:self-auto">
            Start a project
          </Link>
        </nav>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
    </main>
  );
}
