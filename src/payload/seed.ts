import { getPayload } from "payload";
import config from "../payload.config";

/**
 * Populates a fresh database with real Linzido content so the admin panel
 * starts useful instead of empty. Safe to re-run — it clears each managed
 * collection first, so running twice just re-seeds rather than duplicating.
 *
 * Run with: npm run seed
 */
async function seed() {
  const payload = await getPayload({ config });

  console.log("Clearing existing content...");
  for (const collection of [
    "sub-services",
    "services",
    "projects",
    "team-members",
    "testimonials",
    "process-steps",
    "faqs",
  ] as const) {
    const existing = await payload.find({ collection, limit: 1000 });
    for (const doc of existing.docs) {
      await payload.delete({ collection, id: doc.id });
    }
  }

  console.log("Seeding services...");
  const serviceDefs = [
    {
      order: 1,
      displayIndex: "01",
      title: "Web Development",
      slug: "web-development",
      shortDesc:
        "Websites engineered to load fast, rank, and keep converting after you stop paying someone to update them.",
      tags: ["Next.js", "Motion", "UX"],
      heroTitle: "A website that works while no one's editing it.",
      heroSubtitle:
        "Most agency websites start decaying the day they ship — slow on the phone most visitors are actually using, invisible to search, and locked behind a support contract just to change a sentence. We build the opposite: sites tuned for real load speed and structured data from the first commit, with content your own team can edit without calling us. The difference shows up eighteen months later, when a template site has drifted out of date and this one hasn't.",
      idealFor: "Businesses whose website is supposed to generate business, not just exist.",
      differentiator:
        "Most web shops hand you a finished site and disappear until the retainer renews. We also build the CRM your leads land in and the automation that follows up with them — so the website isn't a standalone brochure, it's the front door to a system that's already watching what happens after someone visits.",
      seo: {
        title: "Web Development That Doesn't Decay After Launch",
        description:
          "Fast, CMS-editable websites built by an engineering-led team — tuned for Core Web Vitals and easy to update without a developer.",
      },
      subServices: [
        {
          title: "Custom Websites",
          desc: "A site built around your actual positioning and customers, designed from a blank canvas rather than reskinned from a theme a hundred other businesses are also running.",
          problem:
            "Most small-business sites are visibly built from the same three templates, which quietly tells visitors this company hasn't invested in itself, even when the underlying business is excellent.",
          value:
            "The site is often the first serious interaction a prospect has with a business. If it looks like everyone else's, you're already competing on price before the conversation starts.",
          features: ["Custom design, no theme", "Content editable without a developer", "Structured for search from launch"],
          outcome:
            "A site that looks like it was built specifically for your business, because it was — and one your own team can update without opening a support ticket.",
        },
        {
          title: "Web Management",
          desc: "Ongoing monitoring, security patching, and small content updates, so the site doesn't quietly decay in the months after it ships.",
          problem:
            "A website is finished code the day it launches and starts rotting the day after — plugins go out of date, content goes stale, and nobody notices until a security scanner or a lost customer flags it.",
          value:
            "The businesses that keep their sites current are the ones still ranking two years later; the ones that don't are the ones asking why traffic disappeared.",
          features: ["Monthly content & design updates", "Uptime & performance monitoring", "Security patching"],
          outcome: "A site that's still fast, current, and secure a year from now, without you having to remember to check on it.",
        },
        {
          title: "E-commerce",
          desc: "A storefront engineered around the specific moments that lose sales — slow checkout, stock that's wrong on the page, a cart nobody follows up on.",
          problem:
            "Most lost e-commerce revenue doesn't happen because of bad products or bad prices — it happens at checkout, when a slow or confusing flow gives a paying customer a reason to leave.",
          value:
            "Fixing the mechanics that lose sales at the margin is usually worth more than any single marketing push, because it compounds on every visitor you're already paying to bring in.",
          features: ["Fast, few-step checkout", "Real-time inventory sync", "Automated cart-recovery flows"],
          outcome: "A storefront where the technical experience isn't the reason someone abandons a purchase.",
        },
        {
          title: "Landing Pages",
          desc: "A single page built for one campaign and one action, loading fast enough that ad spend doesn't leak on the page it's sending traffic to.",
          problem:
            "It's common to spend real money driving traffic to a slow, generic landing page and then blame the ad creative when the conversion rate is bad.",
          value:
            "A landing page built to match the specific offer and load in under a couple of seconds routinely outperforms a 'good enough' page for the same ad spend.",
          features: ["Built for A/B testing", "Sub-second load targets", "Conversion analytics wired in"],
          outcome: "A page built to convert the specific traffic you're sending to it, with the data to prove whether it's working.",
        },
      ],
    },
    {
      order: 2,
      displayIndex: "02",
      title: "Digital Marketing",
      slug: "digital-marketing",
      shortDesc:
        "Paid creative, content, and lead systems built to compound instead of resetting every month.",
      tags: ["Funnels", "Content", "Growth"],
      heroTitle: "Growth that doesn't restart every month.",
      heroSubtitle:
        "Most marketing work stops at the click — the creative team hands off a lead, and what happens next is someone else's problem, if it's anyone's. We build the creative, the funnel, and the CRM handoff as one connected system, run by a co-founder who has spent his career turning Meta, Google, TikTok, and LinkedIn spend into pipeline rather than impressions. A good month becomes the baseline you build from, not a number you have to re-earn every thirty days.",
      idealFor: "Businesses spending on ads or content without a system connecting that spend to pipeline.",
      differentiator:
        "The campaigns don't hand off to a black box. Because the same team building your CRM and automation also runs the ads, a lead that comes in on a Tuesday afternoon is already in your pipeline, tagged and routed, before anyone has to remember to enter it manually.",
      seo: {
        title: "Digital Marketing Built to Compound, Not Reset",
        description:
          "Meta Ads, content, branding, and lead generation connected to your CRM — so a good month becomes the baseline, not a fluke.",
      },
      subServices: [
        {
          title: "Meta Ads",
          desc: "Creative and funnels run against pipeline, not vanity engagement metrics.",
          problem:
            "It's easy to run ads that generate likes and cheap clicks while the actual sales pipeline stays flat — the dashboard looks busy and the phone doesn't ring.",
          value:
            "Judging every campaign against a number your business actually tracks — booked calls, qualified leads, revenue — keeps spend honest instead of optimising for a metric that doesn't pay the bills.",
          features: ["Ongoing creative testing", "Funnel built to the specific offer", "ROAS reported against real revenue"],
          outcome: "Campaigns you can defend in a business conversation, not just a marketing one.",
        },
        {
          title: "Social Media Management",
          desc: "A planned content calendar and consistent posting cadence that builds the same audience every month instead of restarting from zero.",
          problem:
            "Sporadic posting — active for three weeks, silent for two months — trains an audience to stop expecting anything from an account, which undoes most of the previous effort.",
          value:
            "Consistency compounds in a way a single viral post never does; a steady account six months in reaches people a sporadic one never will.",
          features: ["Planned content calendar", "Active community management", "Growth reported monthly"],
          outcome: "An account that looks alive and current whenever a prospect checks it before reaching out.",
        },
        {
          title: "Branding",
          desc: "An identity system, not just a logo, so every touchpoint from the website to a proposal document looks like it came from the same company.",
          problem:
            "A business with an inconsistent visual identity — one look on Instagram, another on the invoice, a third on the website — reads as smaller and less serious than it actually is, regardless of the work underneath.",
          value:
            "Visual consistency is one of the cheapest forms of credibility available; it costs nothing to maintain once it's built and it changes how every other touchpoint is perceived.",
          features: ["Logo & visual identity", "Documented brand guidelines", "Reusable design system"],
          outcome: "A defined visual identity your team can apply consistently without a designer approving every asset.",
        },
        {
          title: "Lead Generation",
          desc: "Outbound and inbound engines built to hand your CRM a qualified, already-warm lead instead of a cold name on a spreadsheet.",
          problem:
            "Generic lead generation produces volume — a list of names — while the actual constraint is almost always quality and follow-up speed, not quantity.",
          value:
            "A smaller number of properly qualified leads that get followed up within minutes consistently outperforms a large list nobody has time to work through.",
          features: ["Outbound campaigns", "Landing funnels built to convert", "Direct CRM handoff"],
          outcome: "Leads that land in your CRM already tagged and ready for your team to act on, not a raw list to sort through.",
        },
      ],
    },
    {
      order: 3,
      displayIndex: "03",
      title: "Automation",
      slug: "automation",
      shortDesc:
        "The manual handoffs between your tools, replaced with workflows that don't need someone watching them.",
      tags: ["Workflows", "Integrations", "Ops"],
      heroTitle: "The busywork, engineered out.",
      heroSubtitle:
        "Every business we've worked with has the same three or four manual steps holding everything else together — copying a number between two tools, chasing someone for a status update, re-entering information that already exists somewhere else. We map those steps and replace them with workflows built the way our founder built carrier network automation before Linzido existed: idempotent and monitored, so the same input produces the same output every time, and something alerts a human the moment it doesn't.",
      idealFor: "Operations-heavy businesses where the same three manual steps eat an hour every day.",
      differentiator:
        "Automation is usually sold by people who've never had to be paged at 3am when a workflow silently failed. Ours is built by someone whose old job was exactly that — which is why error handling and monitoring aren't checkbox features here, they're the part he actually cares about.",
      seo: {
        title: "Business Process Automation, Engineered Like Infrastructure",
        description:
          "Workflow automation and integrations built to be monitored and idempotent — the same input produces the same output, every time.",
      },
      subServices: [
        {
          title: "AI Automation",
          desc: "Workflows that run without someone checking on them, with monitoring built in so a failure gets caught before a client notices it.",
          problem:
            "Most 'automation' quietly becomes a liability the first time it fails silently — a workflow stops running and nobody finds out until a customer complains.",
          value:
            "A workflow is only actually useful if you can trust it enough to stop watching it, which requires monitoring and error handling to be part of the build, not an afterthought.",
          features: ["Workflow design & mapping", "Explicit error handling", "Monitoring & alerts, not silent failure"],
          outcome: "A workflow you can actually stop checking on, because something else is checking on it for you.",
        },
        {
          title: "Business Automation",
          desc: "The manual bridge between your tools, replaced so data and tasks move on their own instead of waiting on a person to relay them.",
          problem:
            "Most operational drag isn't one big broken process — it's several small manual handoffs, each only taking a few minutes, that together eat hours of someone's week.",
          value:
            "Removing those handoffs doesn't just save time; it removes the specific point where information gets forgotten, mistyped, or delayed.",
          features: ["CRM data sync", "Document generation, automated", "Reporting pipelines that update themselves"],
          outcome: "Fewer places where a person is the reason something didn't happen on time.",
        },
        {
          title: "Workflow Integrations",
          desc: "Custom connections between the tools you already run, built for the specific way your business actually uses them rather than a generic template.",
          problem:
            "Off-the-shelf integration templates assume a standard use of each tool, and most businesses' actual usage has enough exceptions that the template breaks on real data within a week.",
          value:
            "An integration built around your actual edge cases keeps working when a normal customer does something slightly unusual, instead of quietly failing and needing a manual fix.",
          features: ["Direct API integrations", "Zapier/Make flows where they fit", "Custom middleware where they don't"],
          outcome: "Tools that stay in sync even when your business doesn't fit the standard use case they were designed for.",
        },
      ],
    },
    {
      order: 4,
      displayIndex: "04",
      title: "CRM Development",
      slug: "crm-development",
      shortDesc:
        "A CRM configured — or built — around how your team actually sells, not how the software assumes you do.",
      tags: ["CRM", "Integrations", "Ops"],
      heroTitle: "A CRM that fits the way you sell.",
      heroSubtitle:
        "Off-the-shelf CRMs assume a sales process you probably don't run — stages that don't match how a deal actually moves, fields nobody fills in because they don't apply, automations built for a business that isn't yours. We configure the systems flexible enough to bend that far, and build the ones that aren't from scratch, so your team ends up with a pipeline that matches reality instead of a template you're working around.",
      idealFor: "Sales teams forcing their process into a CRM template, or still running deals from memory and spreadsheets.",
      differentiator:
        "A CRM built by an automation and web team, not a CRM consultancy that stops at configuration, means the system you get is already wired to your website's lead forms and your marketing's follow-up sequences — not a separate island your sales team has to feed manually.",
      seo: {
        title: "CRM Setup & Custom CRM Development",
        description:
          "CRM systems configured — or built from scratch — around how your sales team actually sells, not a template pipeline.",
      },
      subServices: [
        {
          title: "CRM Setup",
          desc: "Correct configuration from day one — pipeline stages, fields, and permissions that match your sales process instead of the software's defaults.",
          problem:
            "Most CRMs get set up in an afternoon using the default pipeline, and six months later nobody trusts the data in it because it never matched how deals actually move.",
          value:
            "A CRM your team actually updates is worth more than a more expensive CRM nobody trusts, and that depends entirely on whether the setup matched reality from the start.",
          features: ["Pipeline built to your process", "Team onboarding included", "Clean data migration"],
          outcome: "A CRM your sales team will actually use daily, because it reflects how they actually sell.",
        },
        {
          title: "Custom CRM Development",
          desc: "Built from scratch when your process doesn't fit any off-the-shelf tool — you own the resulting system outright, not a subscription to it.",
          problem:
            "Some sales processes — usage-based pricing, multi-party approvals, unusual territory logic — genuinely don't fit any commercial CRM without expensive, fragile workarounds.",
          value:
            "Owning the system outright means the logic can actually match your business instead of your business bending around a vendor's roadmap.",
          features: ["Custom fields & business logic", "Role-based access control", "Full ownership of the codebase"],
          outcome: "A system that fits your specific process, that you own outright instead of renting.",
        },
        {
          title: "CRM Integrations",
          desc: "Your CRM connected to marketing, support, and finance, so a deal closing in one tool actually updates the others.",
          problem:
            "When a CRM sits disconnected from the rest of the stack, closing a deal means someone manually updating three other systems, and eventually someone forgets.",
          value:
            "Connected systems mean the state of a deal is true everywhere at once, which is the difference between a CRM that's a source of truth and one that's a source of arguments.",
          features: ["Two-way data sync", "Automated triggers across tools", "Custom reporting dashboards"],
          outcome: "One accurate picture of a deal, visible the same way in every tool your team touches.",
        },
      ],
    },
    {
      order: 5,
      displayIndex: "05",
      title: "AI Solutions",
      slug: "ai-solutions",
      shortDesc:
        "Chatbots and agents that take real action on your business, with a human in the loop wherever it matters.",
      tags: ["Chatbots", "Agents", "RAG"],
      heroTitle: "AI that acts, with a human still in the loop.",
      heroSubtitle:
        "A chatbot that only answers questions is a search bar with extra steps. We build agents that do the actual work — researching a prospect before anyone writes to them, updating a record, resolving a support ticket — and route anything low-confidence to a person instead of guessing and hoping. It's trained on your business specifically, not fine-tuned on a generic script that breaks the moment someone asks something unexpected.",
      idealFor: "Businesses that want AI to actually do the work, not just answer questions about it.",
      differentiator:
        "Most 'AI agencies' are prompt-engineering shops bolted onto no other capability. Ours sits inside a team that also builds the CRM the agent updates and the automation it triggers, so the AI isn't a chatbot widget floating on top of your business — it's wired into the same system as everything else.",
      seo: {
        title: "AI Chatbots & Agents That Take Real Action",
        description:
          "Agentic AI systems trained on your business — chatbots, outreach agents, and automations with a human in the loop where it matters.",
      },
      subServices: [
        {
          title: "AI Chatbots",
          desc: "Trained on your actual documentation and past conversations, not a generic script that breaks the moment someone asks something unexpected.",
          problem:
            "Most chatbots are a decision tree wearing an AI label — they handle three phrasings of the same question and fall apart on the fourth.",
          value:
            "A bot trained on your real support history handles the long tail of actual questions instead of just the ones someone anticipated when writing the script.",
          features: ["Trained on your own data", "Deployed across your channels", "Handoff to a human when it's stuck"],
          outcome: "A first line of support that actually resolves common questions, and knows when to step aside for a person.",
        },
        {
          title: "AI Agents",
          desc: "Agents that research, decide, and act across multiple steps, with guardrails so \"autonomous\" doesn't mean \"unsupervised.\"",
          problem:
            "An agent given real access to your systems without guardrails is a genuine risk, not a convenience — the same autonomy that saves time can also take the wrong action at scale.",
          value:
            "Guardrails and monitoring aren't a limitation on what the agent can do; they're what makes it safe to actually let it act instead of just draft suggestions for a human to approve.",
          features: ["Tool use across your systems", "Multi-step reasoning, not single replies", "Guardrails & activity monitoring"],
          outcome: "An agent doing real multi-step work, with a monitored trail of what it did and why.",
        },
        {
          title: "AI Outreach Systems",
          desc: "An agent pipeline that researches each prospect before writing to them, and flags anything low-confidence instead of sending it anyway.",
          problem:
            "AI-written outreach at scale usually means either obviously templated messages that get ignored, or unverified claims about a prospect that get a reply and then embarrass the sender.",
          value:
            "Researching before writing, and routing uncertain cases to a person, keeps the volume advantage of AI without inheriting its main failure mode.",
          features: ["Per-prospect research", "Personalised drafting, not templates", "Reply handling with human fallback"],
          outcome: "Outreach that reads like it was actually written for the person receiving it, at a volume one person couldn't produce alone.",
        },
      ],
    },
  ];

  for (const def of serviceDefs) {
    const service = await payload.create({
      collection: "services",
      draft: false,
      data: {
        published: true,
        _status: "published",
        order: def.order,
        displayIndex: def.displayIndex,
        title: def.title,
        slug: def.slug,
        shortDesc: def.shortDesc,
        tags: def.tags.map((value) => ({ value })),
        heroEyebrow: "Service",
        heroTitle: def.heroTitle,
        heroSubtitle: def.heroSubtitle,
        idealFor: def.idealFor,
        differentiator: def.differentiator,
        seo: def.seo,
      },
    });

    for (let i = 0; i < def.subServices.length; i++) {
      const sub = def.subServices[i];
      await payload.create({
        collection: "sub-services",
        data: {
          parentService: service.id,
          order: i + 1,
          title: sub.title,
          slug: sub.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          desc: sub.desc,
          problem: sub.problem,
          value: sub.value,
          features: sub.features.map((value) => ({ value })),
          outcome: sub.outcome,
        },
      });
    }
  }

  // The self-referential "case study" of Linzido's own marketing site was
  // deliberately dropped — using your own site as portfolio evidence reads
  // as thin to a skeptical buyer, and every other project here demonstrates
  // the same "ad hoc process → engineered system" pattern more credibly.
  console.log("Seeding projects...");
  const projects = [
    {
      order: 1,
      title: "Civil Tracker",
      slug: "civil-tracker",
      category: "Web & Mobile App",
      year: "2023",
      desc: "A full-stack web and Android platform for a civil engineering business — projects, payments, workforce, and deadlines in one place.",
      stack: ["React", "Node.js", "PostgreSQL"],
      accent: "#4d6dff",
      liveUrl: "https://civil-tracker.onrender.com/",
      study: {
        context:
          "A civil engineering business running multiple active projects — client payments, daily worker wages, contractor fees, supplier invoices, and hard deadlines — coordinated through WhatsApp messages, paper registers, and Excel sheets instead of one system.",
        problem:
          "Running a civil engineering business means juggling dozens of moving parts at once — active projects, payments landing at different stages, daily wages, contractor fees, supplier invoices, and deadlines that can't be missed. Managing all of it through scattered messages, paper, and spreadsheets meant there was no single source of truth: payments got missed, deadlines crept up without warning, and the financial health of any given project was impossible to see at a glance.",
        approach:
          "Rather than adapting a generic project-management tool, the platform was built specifically around how a civil engineering business actually operates — projects, payments, and workforce as one connected model instead of three separate systems. It was also built entirely through AI-assisted development, which Linzido leans on directly: modern AI tooling now lets a small, focused team ship real, production-grade software at a pace that used to require a much larger one.",
        role: "Full-stack product design & engineering",
        solution:
          "Civil Tracker centralises every part of running civil projects into one secure, cloud-based platform accessible from a browser or Android phone — real-time visibility into each project's financial health, upcoming deadlines, workforce costs, and outstanding payments, with automated daily alerts pushed to the owner's phone even when the app is closed. The backend is a Node.js/Express REST API on Render with PostgreSQL on Supabase; the frontend is React and Vite with Tailwind; JWT handles authentication with role-based access built directly into the token rather than a heavier permissions framework; and the Android app is the same web app wrapped with Capacitor, so every deployment updates the phone app instantly with no separate rebuild. Push notifications run through Firebase Cloud Messaging, triggered by a secured daily cron job rather than an always-on connection, and PDF invoices and reports are generated server-side so they render identically regardless of device.",
        highlights: [
          "Project management — budgets, deadlines, client details, and real-time financial summaries per project",
          "Unified payment ledger — receivables and payables across six currencies (PKR, USD, AED, EUR, GBP, SAR)",
          "Workforce management — daily attendance and wages, plus salaried staff with automatic overtime and advance deductions",
          "Contractor tracking — contract values, payment history, and outstanding balances per subcontractor",
          "Six customisable PDF invoice templates with company branding and colour personalisation",
          "Daily 6pm push notifications for deadlines, overdue projects, and pending payments, delivered via Firebase",
          "Runs entirely on free-tier hosting — production software at close to zero infrastructure cost",
        ],
        outcomes: [
          "The business now sees every project's financial health, deadlines, and workforce costs in one place instead of across WhatsApp, paper, and spreadsheets — with daily alerts replacing the missed payments and last-minute deadline surprises that came before it.",
        ],
      },
    },
    {
      order: 2,
      title: "Stay-Track",
      slug: "stay-track",
      category: "SaaS Product",
      year: "2024",
      desc: "A multi-tenant property management SaaS for Airbnb and short-term rental hosts — bookings, revenue, and team coordination in one platform.",
      stack: ["React", "Supabase", "Node"],
      accent: "#7c5cff",
      liveUrl: "https://airbnb-tracker-frontend.onrender.com/",
      study: {
        context:
          "Short-term rental hosts running multiple Airbnb and short-term-rental properties — particularly in the Pakistani rental market — coordinating bookings, revenue, and staff across spreadsheets and WhatsApp instead of a purpose-built system.",
        problem:
          "Hosts managing multiple properties relied on scattered spreadsheets, WhatsApp messages, and manual calculations to run the business. No affordable, purpose-built tool combined booking management, financial tracking, real-time occupancy monitoring, and team collaboration in one platform for this market.",
        approach:
          "Built in phases rather than all at once: it started on Google Sheets as a zero-cost database to validate the idea, then moved to a proper Node.js/Express API once the data and permission model outgrew a spreadsheet. A one-time migration script carried every existing booking and property across with no downtime, and the frontend was built mobile-first from the start — safe-area insets, 44px touch targets, and a PWA manifest so it installs as a home-screen app on Android while a full React Native version is in development.",
        role: "End-to-end product design & engineering",
        solution:
          "A multi-tenant web application where each business operates in its own fully isolated environment — bookings, properties, expenses, and activity log — with role-based permissions granted through an admin-reviewed join-code workflow. The frontend is a React dashboard with a Stripe/Linear-inspired dark and light theme built on CSS custom properties and a collapsible sidebar rather than tab navigation. The backend is a Node.js/Express REST API on Render backed by Supabase Postgres, with bcrypt password hashing, JWT sessions, Google and Facebook OAuth, rate limiting, and Helmet security headers, plus server-side caching and a batched init endpoint to keep the free hosting tier responsive.",
        highlights: [
          "Multi-business architecture — each business fully isolated, with its own bookings, properties, expenses, and activity log",
          "Join-code workflow — admins review requests and grant granular, per-user permissions",
          "Gantt-style calendar — colour-coded booking bars per property, with click-to-detail popups",
          "Daily Monitor — a real-time occupancy dashboard with a live occupancy percentage",
          "Finance hub — WhatsApp payment reminders, per-property expenses, and a live PKR/USD toggle",
          "Branded PDF invoices sent straight to guests over WhatsApp",
          "Installable as a PWA today, with a full React Native app in development",
        ],
        outcomes: [
          "Bookings, occupancy, finances, and team permissions now live in one dashboard instead of spreadsheets and WhatsApp threads — with role-based access so owners, staff, and cleaners each see only what they act on.",
        ],
      },
    },
    {
      order: 3,
      featured: true,
      title: "Business Websites",
      slug: "business-websites",
      category: "Web / Collection",
      year: "2020—",
      desc: "A collection of high-converting sites built for growing businesses.",
      stack: ["Next.js", "Tailwind", "SEO"],
      accent: "#4d6dff",
      study: {
        context:
          "Small and mid-sized businesses replacing sites that were technically live but functionally invisible — slow, unranked, and last updated by whoever built them originally.",
        problem:
          "Small businesses were paying for sites that looked acceptable and performed badly — slow on the phones most of their visitors actually used, and invisible to search.",
        approach:
          "A shared Next.js foundation tuned for Core Web Vitals and structured data, then bent to each brand rather than restyled from a template. Content stays editable by the owner, so the site keeps improving after handover instead of decaying.",
        role: "Design & engineering",
        solution:
          "A shared Next.js foundation, tuned for Core Web Vitals and built with structured data from the first commit, customised to each brand rather than restyled from a template, with a CMS layer that lets the owner edit content directly instead of filing a request.",
        highlights: [] as string[],
        outcomes: [
          "Sites stay editable by the owner after handover — improving over time instead of decaying like most template builds.",
        ],
      },
    },
    {
      order: 4,
      title: "AI Outreach Suite",
      slug: "ai-outreach",
      category: "AI System",
      year: "2024",
      desc: "Agentic outbound engine — research, personalise, and send at scale.",
      stack: ["Python", "OpenAI", "Claude"],
      accent: "#22d3a7",
      study: {
        context:
          "A B2B sales team choosing between two bad options for outbound: slow, genuinely researched messages that couldn't scale, or fast templated blasts that got ignored.",
        problem:
          "Outbound was a choice between volume and relevance. Genuinely researched messages took too long to write; templated ones went out fast and got ignored.",
        approach:
          "An agent pipeline researches each prospect from public sources, drafts on that specific evidence, and routes anything low-confidence to a human rather than sending regardless. Send pacing and reply handling sit outside the model, so the system stays predictable as volume grows.",
        role: "Architecture & engineering",
        solution:
          "A Python agent pipeline using OpenAI and Claude that researches each prospect from public sources before drafting anything, holds send pacing and reply handling outside the model so behaviour stays predictable, and routes any message the system isn't confident about to a human instead of sending it automatically.",
        highlights: [] as string[],
        outcomes: [
          "Low-confidence messages route to a human before sending — volume can grow without the process getting less careful.",
        ],
      },
    },
    {
      order: 5,
      title: "Network Automation Framework",
      slug: "network-automation",
      category: "Infrastructure",
      year: "2022",
      desc: "Carrier-grade automation framework that provisions networks in minutes.",
      stack: ["Python", "Ansible", "CI/CD"],
      accent: "#ff8a4d",
      study: {
        context:
          "A telecom operator provisioning carrier-grade network elements manually, with every engineer running a slightly different version of the same runbook.",
        problem:
          "Provisioning carrier network elements was manual, sequential, and unforgiving — a mistyped parameter surfaced days later as a fault, and every engineer had their own slightly different runbook.",
        approach:
          "Turned the runbooks into idempotent Ansible roles under version control, validated in CI against real device configurations before anything reached production. Rollback became a normal operation rather than an incident.",
        role: "Automation engineering",
        solution:
          "Runbooks rebuilt as version-controlled, idempotent Ansible roles, validated in CI against real device configurations before anything reached production — so provisioning became a repeatable, testable process instead of a manual one a specific engineer had to execute correctly from memory.",
        highlights: [] as string[],
        outcomes: [
          "Provisioning now runs as version-controlled, idempotent roles — rollback is a normal operation, not an incident.",
        ],
      },
    },
  ];

  for (const p of projects) {
    await payload.create({
      collection: "projects",
      draft: false,
      data: {
        published: true,
        _status: "published",
        order: p.order,
        featured: p.featured ?? false,
        title: p.title,
        slug: p.slug,
        category: p.category,
        year: p.year,
        desc: p.desc,
        stack: p.stack.map((value) => ({ value })),
        accent: p.accent,
        liveUrl: p.liveUrl,
        study: {
          context: p.study.context,
          problem: p.study.problem,
          approach: p.study.approach,
          role: p.study.role,
          solution: p.study.solution,
          highlights: p.study.highlights.map((value) => ({ value })),
          outcomes: p.study.outcomes.map((value) => ({ value })),
        },
      },
    });
  }

  console.log("Seeding team members...");
  await payload.create({
    collection: "team-members",
    data: {
      order: 1,
      name: "Muneeb Ur Rehman",
      role: "Founder",
      bio: "Spent years automating carrier-grade network infrastructure — the kind of system where a mistake shows up as an outage, not a bug ticket. Linzido applies that same standard to the systems growing businesses run on: websites, CRMs, workflows, and AI agents built to hold up, not just to launch.",
    },
  });
  await payload.create({
    collection: "team-members",
    data: {
      order: 2,
      name: "Imran Johar",
      role: "Co-Founder",
      bio: "A performance marketing expert who turns paid advertising into measurable growth — building data-driven campaigns across Meta, Google, TikTok, and LinkedIn Ads that reach the right audience and maximise ROI. Not just running ads: building growth campaigns that turn attention into customers.",
    },
  });

  console.log("Seeding testimonials...");
  const testimonials = [
    {
      quote:
        "Muneeb rebuilt our entire lead pipeline with AI. We booked more calls in a month than the previous quarter.",
      name: "Sarah Malik",
      title: "Founder, GrowthLab",
    },
    {
      quote:
        "The website felt like something a $50k agency would ship. Fast, cinematic, and it converts.",
      name: "David Chen",
      title: "CEO, Stay-Track",
    },
    {
      quote:
        "Our support is now fully automated with an AI agent that actually sounds like us. Game changer.",
      name: "Aisha Rahman",
      title: "COO, NovaCare",
    },
    {
      quote:
        "Linzido's automations quietly save us 30+ hours a week. It just runs in the background.",
      name: "Tomás Rivera",
      title: "Operations, Vellum",
    },
    {
      quote:
        "Strategy, design, engineering — rare to find all three at this level in one person.",
      name: "Emily Novak",
      title: "Marketing Director, Kort",
    },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    await payload.create({
      collection: "testimonials",
      data: { order: i + 1, ...testimonials[i] },
    });
  }

  console.log("Seeding process steps...");
  const processSteps = [
    {
      step: "01",
      title: "Discover",
      body: "We start by mapping how the business actually runs today, not how it's supposed to run — the tools in use, the manual steps holding things together, and which single bottleneck is costing the most. Nothing gets designed until we can say precisely what it's replacing and why that thing isn't working.",
    },
    {
      step: "02",
      title: "Design",
      body: "Architecture and data flow get decided before any code does: what the system needs to do, what happens when a step fails, and who's responsible for the decision it can't make on its own. Deciding this upfront is what keeps a project from being redesigned halfway through.",
    },
    {
      step: "03",
      title: "Build",
      body: "Production-grade from the first commit, not a prototype we polish later — the same standard a payment flow or a network rollout would get, applied here from day one. You see working pieces as they're built, not a single reveal at the end.",
    },
    {
      step: "04",
      title: "Launch",
      body: "We launch in pieces you can react to, not one all-or-nothing cutover, so a wrong assumption surfaces early instead of on day ninety. Anything that needs a decision from you gets raised the moment it comes up, not stacked into a review meeting.",
    },
    {
      step: "05",
      title: "Scale",
      body: "Once it's live, we watch how it's actually used — which parts of a CRM nobody touches, which automation triggers more often than expected — and adjust from there. The version that ships on launch day is rarely the version still running a year later, and that's expected, not a failure of the plan.",
    },
  ];
  for (let i = 0; i < processSteps.length; i++) {
    await payload.create({
      collection: "process-steps",
      data: { order: i + 1, ...processSteps[i] },
    });
  }

  console.log("Seeding company settings...");
  await payload.updateGlobal({
    slug: "company-settings",
    data: {
      name: "Linzido",
      tagline: "Engineering the systems businesses run on.",
      description:
        "We build the websites, CRMs, automations, and AI agents that businesses run on — engineered by one team, not stitched together from five vendors.",
      story:
        "Linzido started with one observation from a career spent automating carrier-grade network infrastructure: almost everything that goes wrong in a growing business goes wrong for the same reason infrastructure goes wrong — not because nobody knew what to do, but because what happened depended on a specific person doing it the same way every single time. A quote is only consistent if the same person prices it. A lead only gets followed up if someone happens to notice it. A network stays up because the engineer who's provisioned it forty times is the one doing it, not the new hire covering their shift.\n\nSo the company was built around removing that dependency wherever it shows up in a business — the website, the CRM, the workflows connecting your tools, the AI handling the parts that used to need a person watching them, and, since Imran Johar joined as co-founder, the paid growth systems turning attention into pipeline instead of just spend. Five disciplines, one team, the same underlying standard: build it once, build it so it holds up, and build it so it still works on the day nobody happens to be looking.",
      email: "muneeb24400@gmail.com",
      location: "Available worldwide · Remote",
      url: "https://linzido.com",
      founderName: "Muneeb Ur Rehman",
      founderNote:
        "I spent years building carrier-grade infrastructure — automation where a mistake doesn't show up as a bug ticket, it shows up as an outage. Linzido applies that same discipline to the systems growing businesses run on: the website, the CRM, the workflows, the AI agents. Built once, built to hold up, not stitched together and hoped for.",
      timeline: [
        {
          year: "2024",
          title: "Founded Linzido",
          body: "Left infrastructure engineering to build AI systems, websites, and automation for businesses, full time.",
        },
        {
          year: "2024",
          title: "Built the core offering",
          body: "Assembled one team across web development, automation, CRM, digital marketing, and AI — so a client's growth doesn't depend on five different vendors agreeing on anything.",
        },
        {
          year: "Now",
          title: "Working with founders and operators",
          body: "Partnering with founders and operators to ship the websites, automations, and AI systems their businesses run on day to day.",
        },
      ],
      metrics: [
        { value: 60, suffix: "+", label: "Projects delivered" },
        { value: 40, suffix: "+", label: "Businesses helped" },
        { value: 6, suffix: " yrs", label: "Engineering experience" },
        { value: 99, suffix: "%", label: "Client retention" },
      ],
      tech: [
        "React", "Next.js", "Node", "Python", "Claude", "OpenAI", "Supabase", "GSAP", "Framer Motion", "Docker",
      ].map((value) => ({ value })),
      socials: [
        { label: "Email", href: "mailto:muneeb24400@gmail.com" },
        { label: "LinkedIn", href: "" },
        { label: "X / Twitter", href: "" },
        { label: "GitHub", href: "" },
      ],
    },
  });

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
