# Pre-Launch SEO Checklist — Linzido

Domain is not live yet (per instruction, nothing in this pass touched deployment). Work through this before pointing `linzido.com` at production.

## Before DNS / go-live
- [ ] Confirm `SITE_URL` (`https://linzido.com`, hardcoded in `layout.tsx`, `sitemap.ts`, `robots.ts`, and both `[slug]` pages) matches the real production domain exactly — protocol, no trailing slash, correct TLD.
- [ ] Set real production environment variables (`PAYLOAD_SECRET`, `DATABASE_URI`) — do not launch on the local SQLite file.
- [ ] Decide whether "Linzido" or "Linzido Solutions" is the name to use going forward (see `SEO-BASELINE.md` naming note) *before* it's live and indexed — renaming after indexing is far more disruptive than deciding now.
- [ ] Fill in the three empty social links (LinkedIn, X, GitHub) in Company Settings if real profiles exist — they currently correctly stay hidden site-wide (Contact, Footer, `sameAs` schema) because they're empty, but that also means Google has fewer signals tying the brand to those profiles.

## Search Console / indexing setup
- [ ] Verify the domain in Google Search Console and Bing Webmaster Tools once live.
- [ ] Submit `https://linzido.com/sitemap.xml` in both.
- [ ] Request indexing for the homepage and all 5 service pages manually on day one rather than waiting for organic crawl.
- [ ] Confirm `robots.txt` is reachable at `/robots.txt` and correctly disallows `/admin` and `/api` in production (this pass added the disallow rules — verify they survived the deploy).

## Structured data validation
- [ ] Run the homepage, one service page, and one work page through Google's Rich Results Test after deploy — confirm `Organization`, `WebSite`, `Person` (×2), `Service`, `BreadcrumbList`, and `FAQPage` (where present) all validate with no errors.
- [ ] Spot-check that the `Person` `@id`s (`#founder-{id}`) resolve to real, stable Team Member IDs and don't shift if the collection is re-seeded.

## Social sharing
- [ ] Share the homepage URL in a private Slack/WhatsApp/LinkedIn draft (not published) to confirm the new dynamic OG image renders correctly with live copy and both founders' names.
- [ ] Do the same for one service page and one work page to confirm their `openGraph.images` (inherited from the same file-based OG image) look acceptable — they currently render the generic Linzido OG image rather than something page-specific, which is fine but worth a conscious decision, not an oversight.

## Analytics & monitoring
- [ ] Confirm Vercel Analytics / Speed Insights actually activate once deployed on Vercel (they're inert locally by design).
- [ ] Set up a Core Web Vitals monitor (Search Console's own report is sufficient to start) and check back after the first real traffic — this pass verified CWV-friendly *implementation* (fonts, image loading, non-blocking 3D scene) but real-user data is the only way to confirm actual scores.

## Content still needed from the client (see `SEO-AUDIT.md` and `KEYWORD-MAP.md` for full context — not blocking launch, but launching without them leaves real gaps)
- [ ] Real, verifiable source for the four homepage metrics (60+ projects, 40+ businesses, 6 yrs, 99% retention) — flagged in earlier work on this project and still unresolved.
- [ ] A decision on whether to publish a genuine business address for local-market SEO — do not fabricate one to unblock this checklist.
- [ ] A photo for co-founder Imran Johar (currently name/role only in the About section and 3D scene).

## Final smoke test (repeat after the production deploy, not just locally)
- [ ] All 12 pages load with no console errors.
- [ ] Contact form actually delivers a submission end-to-end on the production database.
- [ ] The 3D scene loads and the pinned scroll journey works on a real desktop browser.
- [ ] Mobile/flat mode looks correct on a real phone, not just a resized desktop browser.
- [ ] `/admin` login works against the production database and is not accidentally exposed to search (re-check `robots.txt` post-deploy, since some hosts rewrite or ignore it under certain configs).
