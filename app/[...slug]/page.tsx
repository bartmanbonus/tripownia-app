import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UnifiedPage from "@/components/UnifiedPage";
import { findLegacy, legacyItems } from "@/lib/legacy";

const systemPaths = ["okazje", "poradniki", "parkingi", "atrakcje", "esim"];

export async function generateStaticParams() {
  const legacy = legacyItems.map(item => ({ slug: item.path.split("/").filter(Boolean) }));
  const system = systemPaths.map(path => ({ slug: [path] }));
  return [...system, ...legacy];
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
  const content = <UnifiedPage path={path} />;
  if (!systemPaths.includes(slug[0]) && !findLegacy(path)) notFound();
  return content;
}
