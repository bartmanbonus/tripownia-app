import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Public planner stays crawlable. Private account/app screens are not search landing pages.
      disallow: [
        "/admin$", "/admin/", "/api/", "/go/", "/out/",
        "/app$", "/app/", "/dla-ciebie", "/moja-podroz", "/moje-podroze",
        "/dodaj-podroz", "/organizer", "/konto", "/porownaj", "/ulubione",
        "/alerty", "/profil",
      ],
    },
    sitemap: "https://tripownia.pl/sitemap.xml",
    host: "https://tripownia.pl",
  };
}
