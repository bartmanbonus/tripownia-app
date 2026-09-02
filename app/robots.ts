import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/go/",
        "/out/",
      ],
    },
    sitemap: "https://tripownia.pl/sitemap.xml",
    host: "https://tripownia.pl",
  };
}
