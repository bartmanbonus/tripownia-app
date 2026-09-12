import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import UnifiedPage from "@/components/UnifiedPage";
import { findLegacy, legacyCanonicalPath, legacyItems } from "@/lib/legacy";
import { internalAliasPaths, isInternalAlias } from "@/lib/internalAliases";

const systemPaths = new Set([
  "/okazje", "/poradniki", "/parkingi", "/atrakcje", "/esim",
  "/ubezpieczenia", "/transfery", "/wynajem-auta", "/admin",
  "/podroze-po-przezycia", "/dalekie-podroze"
]);

const seoOverrides: Record<string, Metadata> = {
  "/lotniska-w-polsce-bez-limitu-100-ml-plynow": {
    title: "Lotniska bez limitu 100 ml płynów w Polsce 2026 – aktualna lista | Tripownia",
    description: "Które lotniska w Polsce zniosły limit 100 ml płynów? Sprawdź aktualną listę na 2026 rok, zasady kontroli i co możesz mieć w bagażu podręcznym.",
  },
  "/czy-mozna-miec-dwa-bagaze-podreczne-w-samolocie-zasady-w-liniach-lotniczych": {
    title: "Czy można mieć dwa bagaże podręczne? Zasady linii lotniczych 2026 | Tripownia",
    description: "Sprawdź, kiedy możesz zabrać dwa bagaże podręczne do samolotu, czym różni się mały bagaż od kabinowego i co sprawdzić przed lotem.",
  },
  "/czy-mozna-wniesc-jedzenie-do-samolotu-co-wolno-zabrac-na-poklad": {
    title: "Czy można wnieść jedzenie do samolotu? Co wolno zabrać | Tripownia",
    description: "Jedzenie w bagażu podręcznym: co możesz zabrać do samolotu, na co uważać przy płynach i jakie zasady sprawdzić przed kontrolą bezpieczeństwa.",
  },
  "/gdzie-jest-cieplo-w-listopadzie": {
    title: "Gdzie jest ciepło w listopadzie? 12 kierunków na słońce | Tripownia",
    description: "Gdzie polecieć w listopadzie po słońce? Zobacz ciepłe kierunki na krótki wyjazd i wakacje oraz sprawdź, gdzie warto szukać dobrej pogody.",
  },
  "/gdzie-na-sylwestra-2026-2027-15-kierunkow": {
    title: "Gdzie na Sylwestra 2026/2027? 15 kierunków za granicę | Tripownia",
    description: "Pomysły na Sylwestra 2026/2027 za granicą: city break, słońce i dalsze kierunki. Zobacz 15 propozycji i wybierz wyjazd dla siebie.",
  },
  "/gdzie-na-wakacje-we-wrzesniu": {
    title: "Gdzie na wakacje we wrześniu 2026? Ciepłe kierunki | Tripownia",
    description: "Gdzie lecieć we wrześniu na ciepłe wakacje? Sprawdź kierunki z dobrą pogodą, krótszymi kolejkami i propozycje na późne lato.",
  },
  "/jak-dojechac-z-lotniska-do-centrum-miasta-najtansze-opcje-transportu": {
    title: "Jak dojechać z lotniska do centrum? Najtańsze opcje | Tripownia",
    description: "Autobus, pociąg, transfer czy taxi? Sprawdź, jak porównać dojazd z lotniska do centrum i nie przepłacić po przylocie.",
  },
};

export async function generateStaticParams() {
  const paths = new Set<string>();
  for (const item of legacyItems) paths.add(legacyCanonicalPath(item.path).replace(/^\//, ""));
  for (const path of systemPaths) paths.add(path.replace(/^\//, ""));
  for (const path of internalAliasPaths) paths.add(path.replace(/^\//, ""));
  return [...paths].filter(Boolean).map((path) => ({ slug: path.split("/").filter(Boolean) }));
}

function humanize(path: string) {
  const last = decodeURIComponent(path.split("/").filter(Boolean).pop() || "Tripownia");
  return last.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function withCanonical(path: string, metadata: Metadata): Metadata {
  return {
    ...metadata,
    alternates: { ...(metadata.alternates || {}), canonical: path },
  };
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
    "/podroze-po-przezycia": { title: "Podróże po przeżycia — zorza, sakura, safari i więcej | Tripownia.pl", description: "Kalendarz podróży planowanych pod właściwy moment: zorza polarna, sakura, fiordy, safari, wieloryby, jarmarki i egzotyka." },
    "/dalekie-podroze": { title: "Dalekie podróże — Wietnam, Pekin, Nowy Jork, Japonia i więcej | Tripownia.pl", description: "Pomysły na dalsze podróże z Polski: Wietnam, Pekin, Nowy Jork, Japonia, Tajlandia, Bali, Singapur, RPA i więcej." },
    "/admin": { title: "Panel administracyjny | Tripownia.pl", robots: { index: false, follow: false } },
  };

  if (fixed[path]) return withCanonical(path, fixed[path]);

  const item = findLegacy(path);
  if (item) {
    const metadata = seoOverrides[path] || { title: item.title, description: item.description || undefined };
    return withCanonical(path, metadata);
  }

  if (isInternalAlias(path)) {
    return withCanonical(path, {
      title: `${humanize(path)} | Tripownia.pl`,
      description: "Inspiracje i aktualne propozycje Tripowni dla tego tematu.",
    });
  }

  return {};
}

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  if (path === "/indywidualne-planowanie-podrozy-bez-ukrytych-kosztow") permanentRedirect("/okazje");
  const isSystemPath = systemPaths.has(path);
  const legacyItem = findLegacy(path);
  if (!isSystemPath && !legacyItem && !isInternalAlias(path)) notFound();
  return <UnifiedPage path={path} />;
}
