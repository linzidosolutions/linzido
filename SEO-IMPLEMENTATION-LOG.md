# SEO Implementation Log — Linzido

Every change made during this pass. No page was added, removed, renamed, or moved. No visual design, layout, navigation, or branding changed. Cross-reference with `SEO-AUDIT.md` for the "why" behind each item's severity.

---

**File:** `src/app/robots.ts`
**Change:** Added `disallow: ["/admin", "/api"]` alongside the existing `allow: "/"`.
**Reason:** The admin panel and API routes were crawlable; disallowing them stops crawl budget waste and keeps the CMS login screen out of search results. (Audit #3)

---

**File:** `src/app/(site)/layout.tsx`
**Change 1:** Added `alternates: { canonical: "/" }` to `generateMetadata()`.
**Reason:** The homepage was the only page in the site without a self-referencing canonical. (Audit #2)

**Change 2:** Removed `priceRange: "$$"` from the `ProfessionalService` schema object.
**Reason:** No pricing is published anywhere on the site; the value was unverifiable and effectively fabricated. (Audit #4)

**Change 3:** Changed `founder` from a single team-member lookup (`team.find(...)`) to `founders` (`team.filter(...)`), and changed the schema's `founder` field from one `@id` reference to an array of one-per-founder references. Changed the single `Person` node generation into a loop emitting one `Person` per founder, each with its own stable `@id` (`#founder-{id}`).
**Reason:** The schema previously only described the primary founder even though the About section visibly credits both Muneeb Ur Rehman and Imran Johar — structured data was out of sync with the page it describes. (Audit #5)

---

**File:** `src/app/(site)/opengraph-image.tsx`
**Change:** Rewrote from a static component with hardcoded pre-rewrite copy into an `async` component that fetches `getCompanySettings()` and `getTeamMembers()` and renders the live tagline (split across two lines) and a byline listing all current founders.
**Reason:** The previous image advertised the old tagline and only the original founder — anyone sharing a Linzido link on LinkedIn/X/WhatsApp would see a preview that contradicted the actual page content. (Audit #6)

---

**File:** `src/app/(site)/work/[slug]/page.tsx`
**Change 1:** Gallery mapping now reads `g.image.alt` (the real, specific alt text set at upload time) first, falling back to the generic `"{title} — product screenshot"` string only when that field is empty.
**Reason:** Every gallery slide was getting the same generic alt text even though each upload already has a specific, accurate one (e.g. "Civil Tracker — dashboard overview"). (Audit #7)

**Change 2:** Added a `breadcrumbLd` object (`BreadcrumbList`: Home → Work → [project title]) and a second `<script type="application/ld+json">` rendering it alongside the existing `CreativeWork` schema.
**Reason:** No breadcrumb schema existed anywhere on the site despite a clear, real navigation hierarchy. (Audit #8)

---

**File:** `src/app/(site)/services/[slug]/page.tsx`
**Change 1:** Added a `breadcrumbLd` object (`BreadcrumbList`: Home → Services → [service title]) and a matching `<script>` tag alongside the existing `Service`/`FAQPage` schema.
**Reason:** Same as above — real hierarchy, no schema describing it. (Audit #8)

**Change 2:** Changed the "Who this is for" and "Why Linzido" labels from `<p className="eyebrow mb-3">` to `<h2 className="eyebrow mb-3">` — identical class list, no visual change.
**Reason:** These act as real sub-section headings on the page (siblings of the "What's included" `<h2>` below them) but were paragraphs, breaking the heading hierarchy. (Audit #9)

---

**File:** `src/components/sections/TechStack.tsx`
**Change:** Changed the section's intro line from `<p className="mt-6 max-w-2xl font-display text-2xl font-medium text-fg-dim md:text-3xl">` to `<h2>` with the same class list.
**Reason:** It's the de facto heading for this homepage section but wasn't a real heading tag. (Audit #9)

---

**File:** `src/components/sections/About.tsx`
**Change:** Founder photo alt text changed from `{f.name}` to `` `{f.name}, {f.role} of Linzido` ``.
**Reason:** Bare names are less useful to screen readers and image search than a name-plus-role description. (Audit #10)

---

**File:** `src/components/Experience.tsx`
**Change:** Added a visually-hidden (`className="sr-only"`) `<h1>{company.name} — {company.tagline}</h1>`, rendered only inside the `is3D` branch (i.e. exactly when Hero — and its own H1 — is *not* rendered).
**Reason:** The 3D-mode render path had no H1 in the DOM at all; Hero's H1 only exists in flat mode. Gating this new H1 to the opposite branch guarantees exactly one H1 in every render state, never zero and never two. (Audit #1)

---

## Files created (documentation only, no site behavior changed)
- `SEO-BASELINE.md`
- `SEO-AUDIT.md`
- `SEO-IMPLEMENTATION-LOG.md` (this file)
- `KEYWORD-MAP.md`
- `PRE-LAUNCH-SEO-CHECKLIST.md`

## Verification performed after every change
- `npx tsc --noEmit` — clean
- `npx eslint . --max-warnings=0` — clean
- `npm run build` — clean; all 12 pages (including the now-dynamic OG image route) built successfully
