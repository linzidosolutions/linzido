# Linzido — Content & Code Audit

**Generated:** 2026-08-28
**Scope:** Every public section, the 3D scene's floating panels, and every admin-panel collection/global — mapped to its data source in code, with the **actual live values currently stored in the database** (not the seed defaults, though in this case they mostly still match the seed since only a few records have been hand-edited).

**Method:** Live data was pulled directly from the running Payload instance (`payload.find` / `payload.findGlobal` against `payload.db`), not from `src/payload/seed.ts`, so anything edited in `/admin` since seeding is reflected here.

---

## 1. Architecture recap

```
/admin (Payload CMS, SQLite) → src/lib/payload-data.ts (server fetchers)
   → src/app/(site)/page.tsx (Server Component)
   → src/components/Experience.tsx
      → section components (About, Services, Work, Process, Metrics, TechStack, Testimonials, Contact)
      → src/components/three/WorkshopStage.tsx (3D scene, 4 floating panels)
```

Only **published** Services and Projects reach the public site. Everything else (TeamMembers, Testimonials, ProcessSteps, CompanySettings) has no publish flag and is live as soon as saved.

---

## 2. Public sections — data source & live content

### 2.1 Hero (`components/sections/Hero.tsx`) — flat/mobile mode only
| Field | Source | Live value |
|---|---|---|
| Availability badge | `company.name` | "Linzido · Available for new projects" |
| Headline | hardcoded copy | "Building AI-powered systems that businesses grow with." |
| Subhead | `company.description` | "We help businesses scale through AI automation, web development, Meta Ads, and cinematic digital experiences." |
| CTA buttons | hardcoded | "View Projects" → `#work`, "Book a Call" → `#contact` |
| Tag row | hardcoded | AI Automation · Web Development · Growth Strategy |

Note: only renders when `is3D` is false (mobile/no-WebGL/reduced-motion). Desktop visitors see the 3D scene instead, which carries the equivalent pitch in Panel 1.

### 2.2 About (`components/sections/About.tsx`)
Props: `timeline` (from `CompanySettings.timeline`), `company`.

| Field | Live value |
|---|---|
| Heading | "What Linzido is." |
| Description | `company.description` — "We help businesses scale through AI automation, web development, Meta Ads, and cinematic digital experiences." |
| Stat 1 | "6+ Years building" *(hardcoded, not admin-managed)* |
| Stat 2 | "40+ Businesses helped" *(hardcoded, not admin-managed)* |
| Timeline (3 entries, from `CompanySettings.timeline`) | 1. **2024 — Founded Linzido**: "Launched as a studio building premium AI systems, websites, and growth engines for modern businesses."<br>2. **2024 — Built the core offering**: "Assembled the full stack: AI automation, web development, digital marketing, CRM, and AI solutions — one team across every discipline a growing business needs."<br>3. **Now — Helping Businesses Scale**: "Partnering with founders to ship automation, SaaS, and marketing that compounds revenue." |

⚠️ The "6+ / 40+" stat pair under the heading is still hardcoded JSX, not pulled from `CompanySettings.metrics` — editing metrics in admin will not change these two numbers.

### 2.3 Services (`components/sections/Services.tsx`)
Reads all 5 **published** Services, sorted by `order`. Each links to `/services/[slug]`.

| # | Title | Slug | Short desc | Tags |
|---|---|---|---|---|
| 01 | Web Development | `web-development` | Fast, cinematic, conversion-focused websites engineered to impress. | Next.js, Motion, UX |
| 02 | Digital Marketing | `digital-marketing` | Performance creative and content systems that build real audiences. | Funnels, Content, Growth |
| 03 | Automation | `automation` | Autonomous workflows that run your operations while you sleep. | Workflows, Integrations, Ops |
| 04 | CRM Development | `crm-development` | CRM systems built and configured around how your team actually sells. | CRM, Integrations, Ops |
| 05 | AI Solutions | `ai-solutions` | Conversational and agentic AI systems trained on your business. | Chatbots, Agents, RAG |

**Sub-services** (`services/[slug]` detail pages, from `SubServices`, 17 total):

- **Web Development** (4): Custom Websites · Web Management · E-commerce · Landing Pages
- **Digital Marketing** (4): Meta Ads · Social Media Management · Branding · Lead Generation
- **Automation** (3): AI Automation · Business Automation · Workflow Integrations
- **CRM Development** (3): CRM Setup · Custom CRM Development · CRM Integrations
- **AI Solutions** (3): AI Chatbots · AI Agents · AI Outreach Systems

Each sub-service has a `desc` and 3 `features` — all populated (see §3.2 for full text if needed).

⚠️ **SEO fields are empty on all 5 services** (`seo.title` / `seo.description` are `null`) — services rely on the site-wide fallback metadata rather than per-service SEO copy.

### 2.4 Work (`components/sections/Work.tsx`)
5 **published** Projects, sorted by `order`; each links to `/work/[slug]` if it has case-study content.

| Order | Title | Slug | Category | Year | Accent | Cover image |
|---|---|---|---|---|---|---|
| 1 | Estimator Pro | `estimator-pro` | Web App | 2023 | `#4d6dff` | none (generative gradient used) |
| 2 | Stay-Track | `stay-track` | SaaS Product | 2024 | `#7c5cff` | none |
| 3 | Business Websites | `business-websites` | Web / Collection | 2020— | `#4d6dff` | none |
| 4 | AI Outreach Suite | `ai-outreach` | AI System | 2024 | `#22d3a7` | none |
| 5 | Network Automation Framework | `network-automation` | Infrastructure | 2022 | `#ff8a4d` | none |

All 5 have full case-study text (`problem` / `approach` / `role`), but **every project's `study.outcomes` array is empty** — the "Outcomes" block on `/work/[slug]` case study pages has nothing to render. **No project has a `cover` image or `liveUrl`** — the `Media` collection is completely empty (0 uploads), so every card falls back to the generative-gradient cover, and no project links out to a live site.

### 2.5 Process (`components/sections/Process.tsx`)
5 `ProcessSteps`, sorted by `order`:

| Step | Title | Body |
|---|---|---|
| 01 | Discover | We map the business, the bottlenecks, and where AI creates real leverage. |
| 02 | Design | Architecture, flows, and interface — planned before a line of code ships. |
| 03 | Build | Rapid, production-grade engineering with automation baked into the core. |
| 04 | Launch | Ship fast, measure, and hand over a system that runs itself. |
| 05 | Scale | Iterate on data — compounding growth through continuous optimisation. |

### 2.6 Metrics (`components/sections/Metrics.tsx`)
From `CompanySettings.metrics` (4 items):

| Value | Label |
|---|---|
| 60+ | Projects delivered |
| 40+ | Businesses helped |
| 6 yrs | Engineering experience |
| 99% | Client retention |

### 2.7 TechStack (`components/sections/TechStack.tsx`)
From `CompanySettings.tech` (10 items, marquee): React, Next.js, Node, Python, Claude, OpenAI, Supabase, GSAP, Framer Motion, Docker.

### 2.8 Testimonials (`components/sections/Testimonials.tsx`)
5 `Testimonials`, sorted by `order`:

| Quote | Name | Title |
|---|---|---|
| "Muneeb rebuilt our entire lead pipeline with AI. We booked more calls in a month than the previous quarter." | Sarah Malik | Founder, GrowthLab |
| "The website felt like something a $50k agency would ship. Fast, cinematic, and it converts." | David Chen | CEO, Stay-Track |
| "Our support is now fully automated with an AI agent that actually sounds like us. Game changer." | Aisha Rahman | COO, NovaCare |
| "Linzido's automations quietly save us 30+ hours a week. It just runs in the background." | Tomás Rivera | Operations, Vellum |
| "Strategy, design, engineering — rare to find all three at this level in one person." | Emily Novak | Marketing Director, Kort |

### 2.9 Contact (`components/sections/Contact.tsx`)
| Field | Source | Live value |
|---|---|---|
| Email | `company.email` | `muneeb24400@gmail.com` |
| Location | `company.location` | "Available worldwide · Remote" |
| Socials shown | `company.socials`, filtered to non-empty `href` | Only **Email** shows — LinkedIn, X/Twitter, and GitHub all have empty `href` values in Company Settings, so they exist as rows in admin but never render on the public site. |
| Budget options | hardcoded | < $2k · $2k–5k (default) · $5k–15k · $15k+ |
| Form submissions | POST → `/api/contact` → `Leads` collection | 0 leads currently in the database |

### 2.10 Footer (`components/layout/Footer.tsx`)
| Field | Source | Live value |
|---|---|---|
| Tagline | `company.tagline` | "Building AI-powered systems that help businesses grow." |
| Location | `company.location` | "Available worldwide · Remote" |
| Sitemap links | hardcoded `NAV_LINKS` in `lib/site.ts` | About, Services, Work, Process, Contact |
| Connect links | `company.socials` (active only) | Email only (same gap as Contact section) |
| Copyright | `company.name` + current year | "© 2026 Linzido. Crafted with intent." |

---

## 3. 3D scene — Developer Room floating panels (`components/three/WorkshopStage.tsx`)

All four panels are canvas-drawn textures, generated at runtime from live CMS data (no hardcoded marketing copy left in the scene). They read as one funnel in camera order: **hook → offer → proof → trust + ask**. Clicking a panel scrolls to `#about`, `#services`, `#work`, or `#contact` respectively.

### Panel 1 — Pitch (`pitchTexture`) → routes to `#about`
| Field | Source | Live value |
|---|---|---|
| Eyebrow | `company.name` | "001 — LINZIDO" |
| Headline | `company.tagline` | "Building AI-powered systems that help businesses grow." |
| Body | `company.description` | "We help businesses scale through AI automation, web development, Meta Ads, and cinematic digital experiences." |
| Footer badge | `services.length` | "5 disciplines · one partner" |

### Panel 2 — Services (`servicesTexture`) → routes to `#services`
Lists the first 6 published services (all 5 currently fit), each showing `displayIndex`, `title`, `shortDesc`:
`01 Web Development` · `02 Digital Marketing` · `03 Automation` · `04 CRM Development` · `05 AI Solutions` (descriptions match §2.3 table).

### Panel 3 — Proof (`proofTexture`) → routes to `#work`
| Field | Source | Live value |
|---|---|---|
| Metrics (up to 4) | `company.metrics` | 60+ Projects delivered · 40+ Businesses helped · 6 yrs Engineering experience · 99% Client retention |
| Testimonial | `testimonials[0]` | "Muneeb rebuilt our entire lead pipeline with AI. We booked more calls in a month than the previous quarter." — Sarah Malik, Founder, GrowthLab |

### Panel 4 — Founder + CTA (`founderCtaTexture`) → routes to `#contact`
| Field | Source | Live value |
|---|---|---|
| Founder name | `founder?.name` (first `TeamMembers` doc) or `company.founderName` fallback | "Muneeb" (first name only, per `.split(" ")[0]`) |
| Role | `founder?.role` or "Founder" fallback | "Founder" |
| Role line | `${founderRole} of ${company.name}` | "Founder of Linzido" |
| Note | `founderNote` prop (passed from `company.founderNote` in the page, per `page.tsx`) | "I'm Muneeb — an engineer who moved from building carrier-grade infrastructure to designing the AI systems that run modern businesses. Linzido is where that turns into product." |
| CTA button | hardcoded | "Book a call →" |
| URL | `company.url` | "https://linzido.com" |

⚠️ `TeamMembers[0].photo` is `null` (no image uploaded), so the founder card has no headshot in either the 3D panel or anywhere on the site — `Media` is empty across the whole project.

---

## 4. Admin panel — every collection & global, end-to-end

### 4.1 Services (5 docs) — full record set
All 5 are `published: true`, `_status: "published"`. Fields per doc: `order`, `displayIndex`, `title`, `slug`, `shortDesc`, `tags[]`, `heroEyebrow` (all "Service"), `heroTitle`, `heroSubtitle`, `seo.title`/`seo.description` (**all null**).

Hero copy used on `/services/[slug]`:
| Service | Hero title | Hero subtitle |
|---|---|---|
| Web Development | "Web Development that converts." | "Premium, high-performance websites and web apps — built to load fast, rank well, and turn visitors into clients." |
| Digital Marketing | "Digital Marketing that compounds." | "Meta Ads, social management, branding, and lead generation — systemised so growth doesn't depend on luck." |
| Automation | "Automation that removes the busywork." | "Connect your stack and automate the repetitive work — so your team spends time on what actually needs a human." |
| CRM Development | "CRM Development built around your process." | "From setup to custom-built systems — a CRM that fits your sales process instead of forcing you into someone else's." |
| AI Solutions | "AI Solutions that act, not just answer." | "Chatbots, autonomous agents, and outreach systems — trained on your business, on brand, working 24/7." |

### 4.2 SubServices (17 docs)
See §2.3 for the full title list grouped by parent. Every sub-service has a filled `desc` and exactly 3 `features`. Example (full detail, one per parent, representative):
- *Custom Websites* (Web Dev #1): "Bespoke marketing sites designed around your brand, not a template." — Custom design, CMS-editable content, SEO-ready structure.
- *Meta Ads* (Marketing #1): "Performance creative and funnels that turn spend into pipeline." — Creative testing, Funnel design, ROAS reporting.
- *AI Automation* (Automation #1): "Autonomous workflows that run your operations without manual input." — Workflow design, Error handling, Monitoring & alerts.
- *CRM Setup* (CRM #1): "Fast, correct configuration of the CRM your team will actually use." — Pipeline setup, Team onboarding, Data migration.
- *AI Chatbots* (AI #1): "Conversational systems trained on your business, on brand, 24/7." — Custom training data, Multi-channel deploy, Human handoff.

(Full 17-record text is reproduced verbatim in §2.3 and matches what's rendered on each `/services/[slug]` page — nothing is truncated on the public site.)

### 4.3 Projects (5 published docs)
See §2.4 table. All have `study.problem`, `study.approach`, `study.role` filled; **all have empty `study.outcomes`**; **none have `cover` or `liveUrl` set**.

### 4.4 TeamMembers (1 doc)
- **Muneeb Ur Rehman** — Founder. Bio: "An engineer who moved from building carrier-grade infrastructure to designing the AI systems that run modern businesses. Linzido is where that turns into product: automation, software, and growth that compounds." `photo: null`, `socials: []` (empty array — no social links added for this team member specifically, separate from the company-wide socials in Company Settings).

Only one team member exists — no other hires/collaborators are in the CMS yet.

### 4.5 Testimonials (5 docs)
Full list in §2.9. All fields (`quote`, `name`, `title`) populated on every record.

### 4.6 ProcessSteps (5 docs)
Full list in §2.5. All fields populated, `order` 1–5, `step` "01"–"05" (string, matches order padded).

### 4.7 Faqs — **0 docs**
The Faqs collection exists in the schema (`question`, `answer`, `relatedService` fields) and `/services/[slug]` pages are wired to render an FAQ block when present, but **no FAQ entries have been created**. Every service page currently skips this block entirely.

### 4.8 Leads — **0 docs**
No contact-form submissions have come in yet (or the collection has been cleared). Schema supports `name`, `email`, `company`, `budget`, `message`, `receivedAt`, `status`, and is auth-gated (only logged-in admins can read leads).

### 4.9 Media — **0 uploads**
The upload library is completely empty. This is the root cause of every "null" image seen elsewhere in this audit: no project covers, no team photos. `staticDir` resolves to `public/media` — nothing has been placed there via admin yet.

### 4.10 Users (1 doc)
- **muneeb urrehman** — `muneeb24400@gmail.com` — the sole admin account. 3 active/expired session tokens on record (not sensitive to report existence-of, but not reproduced here).

### 4.11 CompanySettings (global, singleton)
| Field | Live value |
|---|---|
| name | Linzido |
| tagline | Building AI-powered systems that help businesses grow. |
| description | We help businesses scale through AI automation, web development, Meta Ads, and cinematic digital experiences. |
| email | muneeb24400@gmail.com |
| location | Available worldwide · Remote |
| url | https://linzido.com |
| founderName | Muneeb Ur Rehman |
| founderNote | I'm Muneeb — an engineer who moved from building carrier-grade infrastructure to designing the AI systems that run modern businesses. Linzido is where that turns into product. |
| timeline | 3 entries — see §2.2 |
| metrics | 4 entries — see §2.6 |
| tech | 10 entries — see §2.7 |
| socials | Email (`mailto:muneeb24400@gmail.com`) ✅ live · LinkedIn ⚠️ empty href · X/Twitter ⚠️ empty href · GitHub ⚠️ empty href |

---

## 5. Content gaps found (things admin-visible but not yet filled in)

1. **No media uploaded at all** — every project card and the founder card fall back to generated placeholders/no-photo states. Uploading real screenshots/headshots via `/admin` → Media would immediately populate Work cards, case studies, and the 3D founder panel.
2. **All 5 services have empty SEO title/description** — falls back to site-wide metadata instead of per-service search snippets.
3. **All 5 projects have empty `study.outcomes`** — case-study pages render problem/approach/role but no measurable outcomes list.
4. **No project has a `liveUrl`** — no outbound "visit site" links from case studies.
5. **LinkedIn, X/Twitter, and GitHub social links are all empty strings** in Company Settings — rows exist in admin but render nothing publicly (Contact section and Footer both filter these out).
6. **Faqs collection is empty** — the FAQ block on service detail pages never renders.
7. **Only one TeamMember** exists (the founder) — if more staff should appear (e.g. in a future "Team" section), none are seeded yet.
8. **No leads yet** — expected, since this is a live contact form with 0 real submissions so far.
9. **About section's "6+ / 40+" stat pair is hardcoded**, not wired to `CompanySettings.metrics` — editing metrics in admin updates the Metrics section and the 3D Panel 3, but not this specific spot in About.

---

## 6. Quick reference — collection sizes

| Collection/Global | Live doc count |
|---|---|
| Services | 5 (all published) |
| SubServices | 17 |
| Projects | 5 (all published) |
| TeamMembers | 1 |
| Testimonials | 5 |
| ProcessSteps | 5 |
| Faqs | 0 |
| Leads | 0 |
| Media | 0 |
| Users | 1 |
| CompanySettings | 1 (singleton, fully populated) |
