# SEO Audit — Linzido

Companion to `SEO-BASELINE.md` (what existed) and `SEO-IMPLEMENTATION-LOG.md` (what changed). Severity: **Critical** (actively hurts indexing/trust), **High** (real ranking/CTR/accessibility cost), **Medium** (worth fixing, low risk either way), **Low** (polish).

| # | Issue | Affected page(s) | Severity | Recommendation | Status |
|---|---|---|---|---|---|
| 1 | 3D-mode homepage render has **zero H1s** — Hero (which holds the real H1) doesn't mount in 3D mode, and the pitch is delivered as a WebGL canvas texture, not real DOM text. | `/` (3D mode) | **Critical** | Add a screen-reader-only H1 that renders exactly when the visible one doesn't, so every render state has one and only one. | **Fixed** |
| 2 | Homepage has no self-referencing canonical tag. | `/` | High | Add `alternates: { canonical: "/" }` to the root layout's `generateMetadata`. | **Fixed** |
| 3 | `robots.txt` allowed crawling of `/admin` and `/api/*`. Wastes crawl budget and risks the CMS login screen surfacing in search results. | site-wide | High | Add `disallow: ["/admin", "/api"]` to `robots.ts`. | **Fixed** |
| 4 | Organization schema listed `priceRange: "$$"` — no pricing is published anywhere on the site, so this is an unverifiable, effectively fabricated claim. | `/` (schema) | High | Remove the field entirely rather than guess a "correct" value. | **Fixed** |
| 5 | Organization/Person schema only referenced the primary founder — inaccurate now that the site has a named co-founder (Imran Johar) elsewhere on the page (About section). Structured data contradicting visible content is exactly what Google's guidelines warn against. | `/` (schema) | High | Emit one `Person` node per founder and list all of them under `founder`. | **Fixed** |
| 6 | The Open Graph share image was static, hardcoded copy from before this project's positioning rewrite ("Building AI-powered systems that businesses grow with.") and credited only the original founder — stale relative to the live tagline and the current two-person team. Anyone sharing the site link would get a preview that contradicts the page itself. | `/` and everywhere it's shared | High | Make the OG image generator pull from live `CompanySettings`/`TeamMembers`, same as the rest of the metadata. | **Fixed** |
| 7 | Case-study image galleries discarded each image's real, specific alt text (set at upload — e.g. "Civil Tracker — dashboard overview") in favor of a generic `"{title} — product screenshot"` string repeated on every slide. | `/work/[slug]` with a gallery (Stay-Track, Civil Tracker) | Medium | Use the real per-image alt text when present, falling back to the generic string only if it's missing. | **Fixed** |
| 8 | No `BreadcrumbList` structured data anywhere, despite a clear, real hierarchy (Home → Services → [service], Home → Work (`#work`) → [project]). | `/services/[slug]`, `/work/[slug]` | Medium | Add accurate `BreadcrumbList` schema matching the actual navigation path. | **Fixed** |
| 9 | Two section intros were paragraphs styled to look like headings rather than actual heading elements: the "Who this is for" / "Why Linzido" labels on service pages, and the Tech Stack section's intro line. | `/services/[slug]`, `/` (Tech Stack) | Medium | Change the tag from `<p>` to `<h2>` with the identical class list — zero visual change, correct semantic hierarchy for both SEO and screen readers. | **Fixed** |
| 10 | Founder photo alt text was just a name with no role/context. | `/` (About) | Low | Include role: `"{name}, {role} of Linzido"`. | **Fixed** |
| 11 | No dedicated Twitter/X card image (`twitter-image.tsx`) — X falls back to reading the Open Graph image, which is standard and generally works, but is a weaker signal than an explicit one. | site-wide | Low | Not changed — falls back correctly today; only worth a dedicated file if X-specific cropping becomes a real problem. | Open (see Future Recommendations) |
| 12 | Brand-name mismatch between this task's brief ("Linzido Solutions") and the site's actual, consistent brand ("Linzido"). | — | Low (flag, not a bug) | Kept "Linzido" everywhere since it's what the entire existing site uses and the instructions say not to change branding. Needs a human decision if "Linzido Solutions" is meant to be the formal/legal name for future schema (e.g. `legalName`). | Flagged, not changed |
| 13 | No `LocalBusiness` schema, no city/address published anywhere. | site-wide | — (correct as-is) | This is the right state given no genuine local address exists. Do **not** add one without real business address data — see Future Recommendations. | No action (correct) |
| 14 | No dedicated "Software Development" or "SEO" service page, despite both being real capabilities evidenced elsewhere (case studies for the former; "SEO-ready structure" as a Web Development feature for the latter). | — | — | Per instructions, **no new page was created**. Existing pages were optimized to capture the adjacent intent honestly instead (see `KEYWORD-MAP.md`). A dedicated page for either is listed only as a future recommendation, contingent on business justification. | No action (by design) |
| 15 | Blog does not exist. | — | — | Not a defect — it's simply not part of this site. Content-opportunity notes are in Future Recommendations, not an instruction to build one. | No action (by design) |

## Technical SEO — verified clean, no action needed
- HTTPS/production readiness: site is built for `https://linzido.com`, `metadataBase` set correctly.
- No accidental `noindex` anywhere; root layout explicitly sets `robots: { index: true, follow: true }`.
- No duplicate URLs, no redirect chains, no broken internal links found across nav, footer, and all 12 pages.
- `sitemap.xml` only lists real, indexable, canonical URLs — confirmed no drafts/admin/API leakage.
- 404 page exists, is on-brand, and links back home.

## Performance — verified sound, no action needed
- Fonts self-hosted via `next/font`, `display: swap` — no external font-loading delay.
- 3D scene is client-only via `next/dynamic({ ssr: false })` — never blocks the server-rendered HTML or the crawl-relevant content.
- Images already use `next/image` with responsive `sizes` — automatic AVIF/WebP negotiation and lazy-loading are Next.js defaults here, nothing to add.

## Accessibility — verified sound apart from item #1 and #9 above
- Form fields (`Contact.tsx`) use real `<label>` elements.
- Interactive elements are real `<button>`/`<a>` tags throughout, not `<div onClick>`.
- Fixed above: the two heading-hierarchy gaps and the missing-H1 case.
