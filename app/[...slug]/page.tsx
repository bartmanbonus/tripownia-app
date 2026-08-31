import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnifiedPage from "@/components/UnifiedPage";
import { findLegacy, legacyItems } from "@/lib/legacy";

const systemPaths = new Set(["/okazje", "/poradniki", "/parkingi", "/atrakcje", "/esim"]);

export async function generateStaticParams() {
  const paths = new Set<string>();

  for (const item of legacyItems) paths.add(item.path.replace(/^\//, ""));
  for (const path of systemPaths) paths.add(path.replace(/^\//, ""));

  return [...paths]
    .filter(Boolean)
    .map((path) => ({ slug: path.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  const fixed: Record<string, Metadata> = {
    "/okazje": { title: "Okazje podróżnicze | Tripownia.pl", description: "Wybrane przez Tripownię city breaki, wakacje i pakiety z wielu źródeł." },
    "/poradniki": { title: "Poradniki podróżnicze | Tripownia.pl", description: "Praktyczne poradniki, formalności, lotniska, inspiracje i wskazówki przed podróżą." },
    "/parkingi": { title: "Parkingi przy lotniskach | Tripownia.pl", description: "Wybierz parking dopiero po sprawdzeniu lotniska wylotu i szczegółów wyjazdu." },
    "/atrakcje": { title: "Atrakcje i bilety na miejscu | Tripownia.pl", description: "Najpierw wybierz kierunek i plan wyjazdu, potem dobierz wycieczki, bilety i atrakcje." },
    "/esim": { title: "eSIM i internet w podróży | Tripownia.pl", description: "Internet na wyjeździe bez szukania przypadkowej karty SIM po przylocie." },
  };
  if (fixed[path]) return fixed[path];

  const item = findLegacy(path);
  return item ? { title: item.title, description: item.description || undefined } : {};
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const isSystemPath = systemPaths.has(path);
  const legacyItem = findLegacy(path);

  if (!isSystemPath && !legacyItem) notFound();

  return <UnifiedPage path={path} />;
}
