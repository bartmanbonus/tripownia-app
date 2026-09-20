import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account and planner pages must be crawlable so Google can read noindex.
      disallow: ["/admin$", "/admin/", "/api/", "/go/", "/out/"],
    },
    sitemap: "https://tripownia.pl/sitemap.xml",
    host: "https://tripownia.pl",
  };
}
