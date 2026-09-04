# Linzido — Company Site + Admin CMS

A cinematic, dark, editorial site for **Linzido** (AI automation, web development, digital marketing, CRM, AI solutions). All content — services, sub-services, projects, team, testimonials, process, company info, leads — is **admin-editable** via a built-in CMS at `/admin`, with **zero visual change** to the public site: the design layer never reads static content directly, it reads whatever the admin panel publishes.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — design tokens in `globals.css`
- **GSAP + ScrollTrigger**, **Lenis**, **Framer Motion** — animation
- **React Three Fiber** — the cinematic 3D "workshop" scroll scene
- **Payload CMS 3** — the admin backend (`/admin`), SQLite locally, swappable to Postgres/Supabase in production
- **Resend** (optional) — contact-form email delivery

## Getting started (local, zero external accounts needed)

```bash
npm install
cp .env.example .env.local   # already pre-filled for local SQLite dev
npm run dev                  # http://localhost:3000
```

First run: visit `http://localhost:3000/admin` and create the first admin user (Payload prompts you automatically since the database starts empty of users).

To populate the database with real starter content (5 services, sub-services, 6 projects, team, testimonials, process steps, company info):

```bash
npm run seed
```

Re-running `npm run seed` is safe — it clears and re-seeds the managed collections rather than duplicating rows.

## The admin panel (`/admin`)

Everything below is a full CRUD collection — create, edit, publish/unpublish, delete, all from the browser, with **zero code changes** and **zero effect on the site's design**:

| Collection | Powers |
|---|---|
| **Services** | The 5 home-page cards (Web Development, Digital Marketing, Automation, CRM Development, AI Solutions). Each owns a dedicated `/services/[slug]` page (hero, tags, SEO). |
| **Sub Services** | The specific offerings inside a service (e.g. Web Development → Custom Websites, Web Management, E-commerce, Landing Pages) — rendered as cards on that service's page. |
| **Projects** | The Work section cards + `/work/[slug]` case studies — title, cover image, live link, stack, and the problem/approach/outcomes body. |
| **Team Members** | About section founder photo/bio (extend to a full team as it grows). |
| **Testimonials**, **Process Steps**, **Faqs** | Self-explanatory; FAQs can optionally target one service. |
| **Leads** | Every contact-form submission lands here automatically, alongside email delivery. |
| **Company Settings** (global) | One record: name, tagline, email, location, founder's note, the About timeline, metrics, tech stack, and socials. |

Draft/publish is enabled on Services and Projects — a document only appears on the public site once its **Published** checkbox is on *and* it's been published (not left as a draft).

## How content flows (why the design never changes)

```
/admin  →  Payload (SQLite/Postgres)  →  src/lib/payload-data.ts (Server-only fetchers)
        →  page.tsx (Server Component, fetches once per request)
        →  Experience.tsx (passes data down as props)
        →  section components (About, Services, Work, Process, Contact — unchanged JSX/CSS)
```

Section components never import Payload or fetch anything themselves — they only receive typed props. Editing content is purely a data change; the component tree, classNames, and animations are untouched.

## Production: switching from SQLite to Postgres/Supabase

Local dev needs no external service. For production, only `src/payload.config.ts`'s `db` adapter changes:

```ts
// swap sqliteAdapter(...) for:
import { postgresAdapter } from "@payloadcms/db-postgres";
db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
```

Set `DATABASE_URI` to your Supabase/Postgres connection string and `PAYLOAD_SECRET` to a fresh random value (`openssl rand -base64 32`). Nothing else in the app changes.

## Contact form

Posts to `src/app/api/contact/route.ts`, which tries every configured channel and only reports success if at least one accepted the lead:

```
RESEND_API_KEY=            # email delivery
CONTACT_TO_EMAIL=          # defaults to muneeb24400@gmail.com
NEXT_PUBLIC_SUPABASE_URL=  # optional — also persists to a Supabase `leads` table
SUPABASE_SERVICE_ROLE_KEY=
```

Leads are **also always saved to the Payload `leads` collection**, visible in `/admin`, regardless of whether email/Supabase are configured.

## Project structure

```
src/
├─ payload.config.ts        # Payload core config (collections, globals, db adapter)
├─ payload-types.ts          # generated types — run `npm run payload:types` after schema changes
├─ payload/
│  ├─ collections/           # Services, SubServices, Projects, TeamMembers, Testimonials,
│  │                         # ProcessSteps, Faqs, Leads, Media, Users
│  ├─ globals/CompanySettings.ts
│  └─ seed.ts                 # `npm run seed`
├─ app/
│  ├─ (site)/                 # the public site — its own root layout
│  │  ├─ layout.tsx, page.tsx, not-found.tsx, opengraph-image.tsx, icon.svg
│  │  ├─ work/[slug]/page.tsx
│  │  └─ services/page.tsx, services/[slug]/page.tsx
│  ├─ (payload)/               # the admin panel — its own root layout (Payload's)
│  │  ├─ admin/[[...segments]]/
│  │  └─ api/payload/[...slug]/, graphql/, graphql-playground/
│  ├─ api/contact/route.ts
│  └─ sitemap.ts / robots.ts
├─ lib/
│  ├─ payload-data.ts         # server-only data fetchers (getServices, getProjects, ...)
│  ├─ media.ts                # mediaUrl() — safe for client components to import
│  └─ site.ts                 # NAV_LINKS only now (structural, not admin-managed)
└─ components/                # unchanged design layer — sections now take props
```

**Why `(site)` and `(payload)` are separate route groups:** each needs its own `<html>`/`<body>` (Payload's admin renders its own). Without this split they'd nest and Next.js throws a hydration error — this is a real constraint, not a stylistic choice.

**Why `mediaUrl()` lives in its own file:** any client component that imports from `payload-data.ts` — even just a type — would otherwise bundle Payload's entire server runtime (including Node-only APIs) into the browser build and fail to compile. `media.ts` has zero server-only imports, so it's safe everywhere.

## Design tokens

Colors, radii, easings and typography scales are CSS variables in `src/app/(site)/globals.css` (`:root`).

## Deploy

Vercel, zero config. Add `PAYLOAD_SECRET`, `DATABASE_URI` (Postgres/Supabase), and the contact-form env vars in the Vercel dashboard.
