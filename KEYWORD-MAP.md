# Keyword Map — Linzido

Maps realistic search intent to the site's **5 existing service pages** (no new pages created). Each cluster is assigned to exactly one page to avoid the two competing for the same search — the specific overlap risk called out below is resolved explicitly rather than left ambiguous.

---

## `/services/web-development`
**Owns:** web development company, web development agency, web design agency, custom web development, ecommerce development, website redesign, business website design.

**Supported by real site content:** shortDesc, hero copy, and all 4 sub-services (Custom Websites, Web Management, E-commerce, Landing Pages) directly match this cluster. The `Business Websites` case study is real, relevant proof.

**Secondary, feature-level only:** "SEO-ready websites" — genuinely true (a stated feature of the Custom Websites sub-service, and the Business Websites case study explicitly mentions Core Web Vitals/structured-data tuning), but this page should not chase "SEO agency" or "SEO services" as primary intent — see Gap section below.

---

## `/services/digital-marketing`
**Owns:** digital marketing agency, digital marketing services, social media marketing, social media management, Meta Ads / paid social management, branding agency, lead generation.

**Supported by real site content:** all 4 sub-services (Meta Ads, Social Media Management, Branding, Lead Generation) map directly. The page's copy already attributes this discipline to co-founder Imran Johar's real performance-marketing background.

**Not supported — do not target:** "SEO agency," "SEO services," "SEO consultant." SEO is not a named service or sub-service anywhere in the CMS. Do not let this page (or any page) chase that intent as primary until a real SEO offering exists — see Gap section.

---

## `/services/automation`
**Owns:** business automation, business process automation, workflow automation, automation agency, "AI automation" (in the *operations/process* sense).

**Supported by real site content:** all 3 sub-services (AI Automation, Business Automation, Workflow Integrations). The founder's real carrier-infrastructure background is the page's differentiator copy, which is a genuinely distinctive angle competitors can't claim.

**Secondary, case-study-level only:** "WhatsApp automation." This phrase is not a named service anywhere, but the Civil Tracker case study is real, concrete evidence of it (WhatsApp-delivered payment reminders and invoices via Firebase push + WhatsApp deep links). Fine to reference in that case study's own copy; do not add it as a headline claim on the service page itself without a dedicated WhatsApp-automation offering to back it.

---

## `/services/crm-development`
**Owns:** CRM development, custom CRM development, CRM software, CRM integration, CRM automation.

**Supported by real site content:** exact 1:1 match — all 3 sub-services are CRM Setup, Custom CRM Development, CRM Integrations. This is the cleanest, least ambiguous cluster-to-page mapping on the whole site.

---

## `/services/ai-solutions`
**Owns:** AI chatbot development, AI chatbot integration, AI agents, conversational AI, AI outreach systems, "AI automation" (in the *product/agent* sense — see disambiguation below).

**Supported by real site content:** all 3 sub-services (AI Chatbots, AI Agents, AI Outreach Systems) map directly. The AI Outreach Suite case study is concrete supporting proof.

---

## Disambiguation: "AI automation" (the one real overlap risk)
Both `/services/automation` (which has an "AI Automation" sub-service) and `/services/ai-solutions` are plausible landing pages for this exact phrase. Resolved as:
- **`/services/automation`** owns it when the intent is *replacing a manual business process* — workflows, monitoring, error handling, ops.
- **`/services/ai-solutions`** owns it when the intent is *building or deploying an AI agent/chatbot* — a product the AI itself is.

Do not write new copy on either page that competes for the other's half of this phrase.

---

## Not mapped to any page — genuine content gaps (do not fabricate a fix)

| Search intent | Why it's not mapped | What would fix it (future, not now) |
|---|---|---|
| "software development company," "custom software development," "SaaS development" | No dedicated service page exists for this. It's real capability — the Civil Tracker and Stay-Track case studies are full-stack custom SaaS builds — but as a *service*, it's not one of the 5 listed. | A dedicated Software Development service page, only if the business decides to sell it as a distinct offering rather than as an outcome of the other 5. |
| "SEO services," "SEO agency," "local SEO" | Not a named service or sub-service anywhere. "SEO-ready structure" is a supporting feature of Web Development, not a sellable service on its own. | Either a dedicated SEO service page (if genuinely offered) or explicit sub-service copy under Web Development naming it as an offering — needs a real business decision first. |
| "digital agency Pakistan," "web development Islamabad," "software house Rawalpindi" | No address, city, or phone number is published anywhere on the site (`CompanySettings.location` just says "Available worldwide · Remote"). Targeting a specific city without a genuine local presence risks looking like a doorway page and would need fabricated `LocalBusiness` schema, which the brief explicitly prohibits. | Only pursue if there's a real, publishable business address — then add genuine `LocalBusiness` schema and city-relevant copy to the homepage/Contact section, not a new page per city. |
| "UI/UX design agency" | Present only as a tag (`UX`) under Web Development, not its own sub-service. | Could be added as a 5th sub-service under Web Development if the business wants to sell it distinctly — a content decision, not a technical one. |

---

## Homepage
Should not chase any single cluster — it already (correctly) communicates the cross-cutting positioning ("one team, five disciplines") and links to all 5 service pages, which is where the specific keyword intent should land. No change recommended to this balance.
