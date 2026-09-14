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
        "/app/",
        "/profil/",
        "/alerty/",
        "/ulubione/",
        "/porownaj/",
        "/dla-ciebie/",
        "/moja-podroz/",
        "/moje-podroze/",
      ],
    },
    sitemap: "https://tripownia.pl/sitemap.xml",
    host: "https://tripownia.pl",
  };
}
