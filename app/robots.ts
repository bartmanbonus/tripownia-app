import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages with noindex must remain crawlable so crawlers can read the directive.
      disallow: ["/admin$", "/admin/", "/api/", "/go/", "/out/"],
    },
    sitemap: "https://tripownia.pl/sitemap.xml",
    host: "https://tripownia.pl",
  };
}
