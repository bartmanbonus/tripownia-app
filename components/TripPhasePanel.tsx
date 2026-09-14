"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock3, MapPinned, Plane, Sparkles } from "lucide-react";

type PhaseTask = { label: string; href?: string };

type Phase = {
  kicker: string;
  title: string;
  description: string;
  tasks: PhaseTask[];
};

function hoursTo(date?: string) {
  if (!date) return null;
  const value = new Date(date).getTime();
  if (!Number.isFinite(value)) return null;
  return (value - Date.now()) / 3600000;
}

function phaseFor(departureAt: string | undefined, nights: number): Phase {
  const hours = hoursTo(departureAt);
  if (hours === null) {
    return {
      kicker: "USTAW TERMIN",
      title: "Dodaj godzinę wylotu, a Tripownia ustawi priorytety",
      description: "Gdy wpiszesz termin w Mojej podróży, ten ekran będzie zmieniał się automatycznie przed wyjazdem i na miejscu.",
      tasks: [
        { label: "Dodaj datę i godzinę wylotu", href: "/moja-podroz" },
        { label: "Uzupełnij rezerwacje w organizerze" },
        { label: "Zacznij listę pakowania" },
      ],
    };
  }

  const tripHours = Math.max(24, Number(nights || 1) * 24);
  if (hours < -tripHours) {
    return {
      kicker: "PO POWROCIE",
      title: "Wyjazd zakończony — zachowaj to, co przyda się następnym razem",
      description: "Plan i notatki zostają w Moich podróżach. Możesz wrócić do nich przed kolejnym podobnym wyjazdem.",
      tasks: [
        { label: "Sprawdź zapisane podróże", href: "/moje-podroze" },
        { label: "Zapisz miejsca, do których chcesz wrócić" },
        { label: "Ustaw nowy alert cenowy", href: "/alerty" },
      ],
    };
  }

  if (hours <= 0) {
    return {
      kicker: "JESTEŚ W PODRÓŻY",
      title: "Tryb na miejscu",
      description: "Teraz najważniejsze są rzeczy potrzebne tu i teraz: dojazd, plan dnia, internet i atrakcje w pobliżu.",
      tasks: [
        { label: "Otwórz plan dnia poniżej" },
        { label: "Sprawdź transfer i dojazd", href: "/transfery" },
        { label: "Znajdź atrakcje", href: "/atrakcje" },
        { label: "Sprawdź internet / eSIM", href: "/esim" },
      ],
    };
  }

  if (hours <= 24) {
    return {
      kicker: "OSTATNIE 24 GODZINY",
      title: "Dziś liczą się odprawa, dokumenty i dojazd na lotnisko",
      description: "Nie dokładaj już nowych planów. Domknij rzeczy, które mogą zablokować wyjazd.",
      tasks: [
        { label: "Odprawa i karta pokładowa" },
        { label: "Dokumenty + rezerwacje offline" },
        { label: "Bagaż i limity linii lotniczej" },
        { label: "Dojazd / parking przy lotnisku", href: "/parkingi" },
      ],
    };
  }

  if (hours <= 72) {
    return {
      kicker: "1–3 DNI DO WYLOTU",
      title: "Domknij logistykę",
      description: "To moment na pogodę, transfer, internet i ostatnie braki w pakowaniu.",
      tasks: [
        { label: "Sprawdź prognozę pogody" },
        { label: "Potwierdź transfer", href: "/transfery" },
        { label: "Dokończ pakowanie poniżej" },
        { label: "Przygotuj internet / eSIM", href: "/esim" },
      ],
    };
  }

  if (hours <= 24 * 7) {
    return {
      kicker: "3–7 DNI DO WYLOTU",
      title: "Czas na rzeczy, które wymagają rezerwacji",
      description: "Najpierw rzeczy ograniczone dostępnością, dopiero później szczegółowy plan dnia.",
      tasks: [
        { label: "Sprawdź atrakcje i bilety", href: "/atrakcje" },
        { label: "Potwierdź ubezpieczenie" },
        { label: "Sprawdź wymagania wjazdowe", href: "/poradniki" },
        { label: "Uzupełnij plan dzień po dniu" },
      ],
    };
  }

  return {
    kicker: "PRZED WYJAZDEM",
    title: "Masz czas — najpierw zbuduj spokojnie dobry plan",
    description: "Zacznij od dokumentów, rezerwacji i najważniejszych punktów wyjazdu. Szczegóły możesz dopiąć później.",
    tasks: [
      { label: "Sprawdź dokumenty i wymagania", href: "/poradniki" },
      { label: "Uzupełnij numery rezerwacji" },
      { label: "Dodaj 2–3 najważniejsze atrakcje", href: "/atrakcje" },
      { label: "Zacznij listę pakowania" },
    ],
  };
}

export default function TripPhasePanel({ departureAt, nights }: { departureAt?: string; nights: number }) {
  const phase = phaseFor(departureAt, nights);
  const hours = hoursTo(departureAt);
  const countdown = hours === null ? null : hours > 0 ? (hours <= 48 ? `${Math.ceil(hours)} h` : `${Math.ceil(hours / 24)} dni`) : "teraz";

  return (
    <section className="trip-phase-panel">
      <div className="trip-phase-icon">{hours !== null && hours <= 0 ? <MapPinned size={24}/> : <Plane size={24}/>}</div>
      <div className="trip-phase-main">
        <div className="trip-phase-topline"><span>{phase.kicker}</span>{countdown && <em><Clock3 size={14}/>{countdown}</em>}</div>
        <h2>{phase.title}</h2>
        <p>{phase.description}</p>
        <div className="trip-phase-tasks">
          {phase.tasks.map((task, index) => task.href ? (
            <Link href={task.href} key={task.label}><Circle size={17}/><span>{task.label}</span></Link>
          ) : (
            <div key={task.label}>{index === 0 && hours !== null && hours <= 0 ? <Sparkles size={17}/> : <CheckCircle2 size={17}/>}<span>{task.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
