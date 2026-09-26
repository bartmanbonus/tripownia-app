"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Direction = {
  href: string;
  search: string;
  category: string;
  image: string;
  alt: string;
  badges: string[];
  title: string;
  description: string;
};

type Filter = {
  key: string;
  label: string;
};

function normalize(value: string) {
  return String(value || "")
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function DirectionsExplorer({
  directions,
  filters,
}: {
  directions: Direction[];
  filters: Filter[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");

  const visibleDirections = useMemo(() => {
    const q = normalize(query);

    return directions.filter((direction) => {
      const haystack = normalize(
        [direction.search, direction.title, direction.description, ...direction.badges].join(" ")
      );
      const categories = normalize(direction.category).split(/\s+/).filter(Boolean);
      const matchesSearch = !q || haystack.includes(q);
      const matchesFilter = active === "all" || categories.includes(normalize(active));
      return matchesSearch && matchesFilter;
    });
  }, [directions, query, active]);

  return (
    <>
      <div className="directions-v188-tools">
        <label className="directions-v188-search">
          <span aria-hidden="true">⌕</span>
          <input
            id="directions-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Wpisz kraj lub kierunek, np. Grecja, Egipt, Włochy…"
            aria-label="Wyszukaj kierunek podróży"
          />
        </label>

        <div className="directions-v188-filters" aria-label="Filtry kierunków">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={active === filter.key ? "active" : ""}
              aria-pressed={active === filter.key}
              onClick={() => setActive(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="directions-v188-heading">
        <div>
          <small>INSPIRACJE NA KOLEJNY WYJAZD</small>
          <h2>Wybierz miejsce i zacznij od konkretu.</h2>
        </div>
        <span id="directions-count">
          {visibleDirections.length} {visibleDirections.length === 1 ? "kierunek" : "kierunków"}
        </span>
      </div>

      <div className="directions-v188-grid" id="directions-grid" aria-live="polite">
        {visibleDirections.map((direction) => (
          <Link
            key={direction.href}
            href={direction.href}
            className="directions-v188-card"
          >
            <div className="directions-v188-image">
              <img src={direction.image} alt={direction.alt} loading="lazy" decoding="async"/>
              <div className="directions-v188-badges">
                {direction.badges.slice(0,2).map((badge) => <span key={badge}>{badge}</span>)}
              </div>
              <span className="directions-v188-heart" aria-hidden="true">♡</span>
            </div>

            <div className="directions-v188-body">
              <h3>{direction.title}</h3>
              <p>{direction.description}</p>
              <span className="directions-v188-link">Zobacz kierunek <b>→</b></span>
            </div>
          </Link>
        ))}
      </div>

      {visibleDirections.length === 0 && (
        <div className="directions-v188-empty" id="directions-empty">
          <strong>Nie znaleźliśmy takiego kierunku.</strong>
          <span>Zmień filtr lub nazwę albo przejdź do pełnej wyszukiwarki Tripowni.</span>
          <Link href="/#szukaj-samodzielnie">Otwórz wyszukiwarkę →</Link>
        </div>
      )}
    </>
  );
}
