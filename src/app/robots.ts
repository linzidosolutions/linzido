import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin panel and API are functional, not content — crawling them
      // wastes crawl budget and risks the login screen showing up in results.
      disallow: ["/admin", "/api"],
    },
    sitemap: "https://linzido.com/sitemap.xml",
  };
}
