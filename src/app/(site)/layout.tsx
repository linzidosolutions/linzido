import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServices, getCompanySettings, getTeamMembers } from "@/lib/payload-data";
import { jsonLdScript } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const wordmark = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wordmark",
  display: "swap",
});

const SITE_URL = "https://linzido.com";

// Metadata is generated from Company Settings instead of hardcoded, so
// renaming the company or rewriting its description in /admin updates the
// browser tab, search results, and social-share previews without a deploy.
export async function generateMetadata(): Promise<Metadata> {
  const [company, services] = await Promise.all([getCompanySettings(), getServices()]);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${company.name} — ${company.tagline}`,
      template: `%s · ${company.name}`,
    },
    description: company.description,
    keywords: services.map((s) => s.title),
    authors: [{ name: company.name }],
    creator: company.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: SITE_URL,
      title: company.name,
      description: company.description,
      siteName: company.name,
    },
    twitter: {
      card: "summary_large_image",
      title: company.name,
      description: company.description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [services, company, team] = await Promise.all([
    getServices(),
    getCompanySettings(),
    getTeamMembers(),
  ]);
  const founders = team.filter((t) => t.role.toLowerCase().includes("founder"));

  // `sameAs` is what lets Google tie these profiles to the same entity, so it
  // is built from active socials — empty until real profile URLs are filled
  // in, which is correct: claiming a profile that 404s is worse than omitting it.
  const activeSocials = (company.socials ?? []).filter((s) => Boolean(s.href));
  const profileUrls = activeSocials
    .filter((s) => s.href!.startsWith("http"))
    .map((s) => s.href!);

  const organization = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: company.name,
    description: company.description,
    url: SITE_URL,
    email: company.email,
    areaServed: "Worldwide",
    // No published pricing exists anywhere on the site, so no priceRange is
    // claimed here — an unverifiable "$$" would be exactly the kind of
    // fabricated structured data Google's guidelines warn against.
    ...(founders.length
      ? { founder: founders.map((f) => ({ "@id": `${SITE_URL}/#founder-${f.id}` })) }
      : {}),
    ...(profileUrls.length ? { sameAs: profileUrls } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.title,
          description: s.shortDesc,
        },
      })),
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: company.name,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  const graph: Record<string, unknown>[] = [organization, website];

  for (const f of founders) {
    graph.push({
      "@type": "Person",
      "@id": `${SITE_URL}/#founder-${f.id}`,
      name: f.name,
      jobTitle: f.role,
      url: SITE_URL,
      worksFor: { "@id": `${SITE_URL}/#organization` },
    });
  }

  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable} ${wordmark.variable}`}>
      <body>
        {children}
        {/* Cookieless and collects no personal data, so no consent banner is
            required. Both are inert unless deployed on Vercel. */}
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
      </body>
    </html>
  );
}
