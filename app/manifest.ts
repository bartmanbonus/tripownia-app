import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tripownia — My szukamy. Ty lecisz.",
    short_name: "Tripownia",
    description: "Twoje podróże, dopasowane oferty, alerty, porównanie, plan wyjazdu i tryb podróży w jednym miejscu.",
    start_url: "/app?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    orientation: "portrait-primary",
    categories: ["travel", "lifestyle"],
    lang: "pl-PL",
    icons: [
      {
        src: "/tripownia-app-icon-v2.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Moja Tripownia", short_name: "Start", url: "/app" },
      { name: "Moja podróż", short_name: "Podróż", url: "/moja-podroz" },
      { name: "Dla Ciebie", short_name: "Dla Ciebie", url: "/dla-ciebie" },
      { name: "Alerty", short_name: "Alerty", url: "/alerty" },
    ],
  };
}
