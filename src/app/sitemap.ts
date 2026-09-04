import type { MetadataRoute } from "next";
import { getProjects, getServices } from "@/lib/payload-data";

const SITE_URL = "https://linzido.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [projects, services] = await Promise.all([getProjects(), getServices()]);

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    // Service pages are a primary search surface — generated from the same
    // source that renders the pages themselves.
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // Case studies are the site's other long-tail search surface.
    ...projects
      .filter((p) => p.study?.problem && p.study?.approach)
      .map((p) => ({
        url: `${SITE_URL}/work/${p.slug}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.8,
      })),
  ];
}
