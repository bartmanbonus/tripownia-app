import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tripownia — My szukamy. Ty lecisz.",
    short_name: "Tripownia",
    description: "Okazje podróżnicze, ulubione i alerty Tripowni w telefonie.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111827",
    orientation: "portrait-primary",
    categories: ["travel", "lifestyle"],
    lang: "pl-PL",
    icons: [
      {
        src: "/tripownia-app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Ulubione", short_name: "Ulubione", url: "/ulubione" },
      { name: "Alerty", short_name: "Alerty", url: "/alerty" },
      { name: "Okazje", short_name: "Okazje", url: "/#okazje" },
    ],
  };
}
