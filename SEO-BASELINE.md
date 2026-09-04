# SEO Baseline — Linzido

**Recorded:** 2026-09-01, immediately before the SEO optimization pass documented in `SEO-AUDIT.md` and `SEO-IMPLEMENTATION-LOG.md`.

**Purpose:** a snapshot of exactly what existed before any SEO changes were made, so the "preserve the existing structure" requirement is verifiable — nothing listed here as a *page*, *URL*, *section*, or *design element* was added, removed, or renamed during this pass. Only metadata, structured data, semantic HTML (tag names, not visual output), and a few auto-generated files were touched.

**Naming note:** the task brief refers to the business as "Linzido Solutions." The live site — every title, the footer copyright, the admin panel, the schema, the wordmark — consistently uses **"Linzido"** as the brand name (`CompanySettings.name = "Linzido"`). The only place "Linzido Solutions" appears anywhere in the codebase is a code comment explaining the standalone "LS" admin-icon monogram. Per the instruction that the existing website is the source of truth and branding must not change, this pass kept "Linzido" everywhere it already appeared. Flagged in `SEO-AUDIT.md` rather than silently resolved either way.

---

## 1. Full page inventory (12 pages, 5 route files)

| Route | Generated from |
|---|---|
| `/` | static route, data-driven |
| `/services` | static route |
| `/services/web-development` | `Services` collection |
| `/services/digital-marketing` | `Services` collection |
| `/services/automation` | `Services` collection |
| `/services/crm-development` | `Services` collection |
| `/services/ai-solutions` | `Services` collection |
| `/work/civil-tracker` | `Projects` collection |
| `/work/stay-track` | `Projects` collection |
| `/work/business-websites` | `Projects` collection |
| `/work/ai-outreach` | `Projects` collection |
| `/work/network-automation` | `Projects` collection |

Non-content routes: `/admin` (Payload CMS), `/api/payload/*` (REST/GraphQL), `/api/contact` (form submit).

No blog exists in the codebase or CMS. No location/city pages exist.

## 2. Navigation & footer (unchanged, for reference)

- **Navbar** (`src/components/layout/Navbar.tsx`): Logo → `#top`, then `NAV_LINKS` (About, Services, Work, Process, Contact — all in-page anchors on `/`), a ⌘K command palette, and a "Book a Call" CTA → `#contact`.
- **Footer** (`src/components/layout/Footer.tsx`): wordmark + tagline, Sitemap list (same `NAV_LINKS`), Connect list (active socials only), copyright line.
- `NAV_LINKS` lives in `src/lib/site.ts` — five in-page anchors, no dedicated nav items for Services index or individual service/work pages (those are reached via the Services and Work sections' cards).

## 3. Titles, descriptions, canonicals (as they were)

| Page | Title (rendered) | Meta description | Canonical |
|---|---|---|---|
| `/` | `Linzido — Engineering the systems businesses run on.` | *(from `CompanySettings.description`)* "We build the websites, CRMs, automations, and AI agents that businesses run on — engineered by one team, not stitched together from five vendors." | **none set** |
| `/services` | `Services · Linzido` | "Website, CRM, automation, and AI systems — engineered by one team so growth doesn't depend on five vendors talking to each other." | `/services` |
| `/services/[slug]` (×5) | `{service.seo.title}` if set, else `{service.title}` — e.g. "Web Development That Doesn't Decay After Launch" | `{service.seo.description}` if set, else `{service.shortDesc}` | `/services/{slug}` |
| `/work/[slug]` (×5) | `{project.title} — {category} · Linzido` — e.g. "Civil Tracker — Web & Mobile App · Linzido" | `{project.desc}` | `/work/{slug}` |

Homepage title/description come from `generateMetadata()` in `src/app/(site)/layout.tsx`, sourced from `CompanySettings` — editable from `/admin` without a deploy.

## 4. H1 / heading structure (as it was)

| Page | H1 | Notable heading issues found |
|---|---|---|
| `/` (flat mode) | Hero's 4-line animated headline | — |
| `/` (3D mode) | **none** — Hero (which holds the H1) does not render in 3D mode; the pitch is a WebGL canvas texture instead | Zero H1s in this render state |
| `/services` | "Five disciplines. One system." | — |
| `/services/[slug]` | `service.heroTitle` | "Who this is for" / "Why Linzido" labels were `<p>`, not headings |
| `/work/[slug]` | `project.title` | — |
| Homepage section `TechStack` | (h2 owned by `SectionHeading` elsewhere) | Its own intro line was a `<p>` styled as a heading, not a real `<h2>` |

All other homepage sections (About, Services, Work, Process, Testimonials) already used `<h2>` via the shared `SectionHeading` component or their own explicit `<h2>`.

## 5. Structured data (as it was)

Root layout (`(site)/layout.tsx`) emitted one `@graph` with:
- `ProfessionalService` (Organization) — included `priceRange: "$$"` (no published pricing exists anywhere on the site) and `founder` referencing only the primary founder (the cofounder, added earlier in this project's life, was never reflected here).
- `WebSite`.
- One `Person` node (primary founder only).

Per-page schema already present and left untouched in kind:
- `/services/[slug]`: `Service` schema, `FAQPage` schema when FAQs exist.
- `/work/[slug]`: `CreativeWork` schema.
- No `BreadcrumbList` existed anywhere.

## 6. Open Graph / social image (as it was)

`src/app/(site)/opengraph-image.tsx` was a **static, hardcoded** image generator using copy from before the site's positioning rewrite earlier in this project ("Building AI-powered systems that businesses grow with.") and crediting only "Muneeb Ur Rehman · Founder" — both stale relative to the live tagline ("Engineering the systems businesses run on.") and the now-two-person founding team.

## 7. robots.txt / sitemap.xml (as they were)

- `robots.txt` (`src/app/robots.ts`): `allow: "/"` with **no disallow rules** — `/admin` and `/api/*` were crawlable.
- `sitemap.xml` (`src/app/sitemap.ts`): homepage + all 5 service pages + all 5 case-study pages with a case study (11 URLs total), correctly built from the same live data the pages render from. No dead/duplicate/noindex URLs present.

## 8. Images

- All images render through `next/image` with `fill` + `sizes`, giving automatic responsive images, modern-format negotiation (WebP/AVIF), and lazy-loading by default (except `priority` images, used correctly for above-the-fold cover shots).
- Alt text present everywhere an `<Image>` is used, but the project/case-study gallery slider **overrode** each image's real, specific alt text (e.g. "Civil Tracker — dashboard overview") with a generic `"{project.title} — product screenshot"` string for every slide.
- Founder photo alt text was just the name, with no role context.

## 9. Fonts, scripts, performance-relevant setup (as it was)

- Fonts: `next/font/google` (Inter, Space Grotesk, JetBrains Mono, Bebas Neue), self-hosted, `display: "swap"` — no external font requests, no render-blocking font loading.
- The 3D scene (`WorkshopStage`) is loaded via `next/dynamic` with `ssr: false` — it never blocks the initial server-rendered HTML.
- Vercel `<Analytics />` / `<SpeedInsights />` — both non-blocking, inert unless deployed on Vercel.
- `viewport` sets `themeColor`, `colorScheme: "dark"`, standard responsive width/scale.

## 10. 404 page

`src/app/(site)/not-found.tsx` — a real, on-brand 404 with a clear message and a "Back home" link. No changes made; nothing wrong with it.

## 11. Location data

`CompanySettings.location = "Available worldwide · Remote"` — no city, no street address, no phone number published anywhere on the site. No `LocalBusiness` schema existed (correctly, since there's no genuine local presence to describe).

## 12. Blog

Does not exist as a collection, route, or nav item. Not part of the current site.
