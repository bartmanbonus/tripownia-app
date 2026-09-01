import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import UnifiedPage from "@/components/UnifiedPage";
import { findLegacy, legacyItems } from "@/lib/legacy";
import { internalAliasPaths, isInternalAlias } from "@/lib/internalAliases";

const systemPaths = new Set([
  "/okazje", "/poradniki", "/parkingi", "/atrakcje", "/esim",
  "/ubezpieczenia", "/transfery", "/wynajem-auta", "/admin",
  "/podroze-po-przezycia",
  "/islandia-zorza-polarna",
  "/japonia-kwitnienie-wisni",
  "/norwegia-fiordy",
  "/nowa-zelandia-najlepszy-czas"
]);

export async function generateStaticParams() {
  const paths = new Set<string>();
  for (const item of legacyItems) paths.add(item.path.replace(/^\//, ""));
  for (const path of systemPaths) paths.add(path.replace(/^\//, ""));
  for (const path of internalAliasPaths) paths.add(path.replace(/^\//, ""));
  return [...paths].filter(Boolean).map((path) => ({ slug: path.split("/").filter(Boolean) }));
}


function canonicalMetadata(path: string, meta: Metadata): Metadata {
  return {
    ...meta,
    alternates: { canonical: path },
    openGraph: {
      ...(meta.openGraph || {}),
      url: path,
    },
  };
}

function shouldNoIndex(path: string) {
  return path.startsWith("/produkt/") ||
    path === "/tripownia-pl/sklep" ||
    path === "/indywidualne-planowanie-podrozy-bez-ukrytych-kosztow";
}

function humanize(path: string) {
  const last = decodeURIComponent(path.split("/").filter(Boolean).pop() || "Tripownia");
  return last.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const fixed: Record<string, Metadata> = {
    "/okazje": { title: "Okazje podróżnicze | Tripownia.pl", description: "Wybrane przez Tripownię city breaki, wakacje i pakiety z wielu źródeł." },
    "/poradniki": { title: "Poradniki podróżnicze | Tripownia.pl", description: "Praktyczne poradniki, formalności, lotniska, inspiracje i wskazówki przed podróżą." },
    "/parkingi": { title: "Parkingi przy lotniskach | Tripownia.pl", description: "Najpierw sprawdź lotnisko i wyjazd, potem dobierz parking." },
    "/atrakcje": { title: "Atrakcje i bilety | Tripownia.pl", description: "Dobierz atrakcje do konkretnego kierunku i terminu podróży." },
    "/esim": { title: "eSIM i internet w podróży | Tripownia.pl", description: "Internet na wyjeździe — praktyczne informacje i sprawdzony partner." },
    "/ubezpieczenia": { title: "Ubezpieczenie podróżne | Tripownia.pl", description: "Co sprawdzić w polisie przed wyjazdem i jak dopasować zakres do kierunku." },
    "/transfery": { title: "Transfery lotniskowe | Tripownia.pl", description: "Jak zaplanować dojazd z lotniska i kiedy transfer w pakiecie naprawdę się opłaca." },
    "/wynajem-auta": { title: "Wynajem auta na wakacje | Tripownia.pl", description: "Na co uważać przy wynajmie samochodu za granicą." },
    "/admin": { title: "Panel administracyjny | Tripownia.pl" },
  };
  if (fixed[path]) return canonicalMetadata(path, fixed[path]);
  const item = findLegacy(path);
  if (item) {
    return canonicalMetadata(path, {
      title: item.title,
      description: item.description || undefined,
      robots: shouldNoIndex(path) ? { index: false, follow: true } : undefined,
    });
  }
  if (isInternalAlias(path)) {
    return canonicalMetadata(path, {
      title: `${humanize(path)} | Tripownia.pl`,
      description: `Aktualne propozycje, inspiracje i praktyczne informacje: ${humanize(path)}.`,
      robots: shouldNoIndex(path) ? { index: false, follow: true } : undefined,
    });
  }
  return {};
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  if (path === "/indywidualne-planowanie-podrozy-bez-ukrytych-kosztow") redirect("/okazje");
  const isSystemPath = systemPaths.has(path);
  const legacyItem = findLegacy(path);
  if (!isSystemPath && !legacyItem && !isInternalAlias(path)) notFound();
  return <UnifiedPage path={path} />;
}
