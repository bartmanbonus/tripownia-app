"use client";

import { useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";

export default function PlanningInterest() {
  const [period, setPeriod] = useState("Lato 2027");
  const [airport, setAirport] = useState("Warszawa");
  const [budget, setBudget] = useState("3000");
  const [saved, setSaved] = useState(false);

  function savePlan() {
    const item = {
      period,
      airport,
      budget,
      createdAt: new Date().toISOString(),
    };

    try {
      const current = JSON.parse(
        localStorage.getItem("tripownia-plans") || "[]"
      );

      localStorage.setItem(
        "tripownia-plans",
        JSON.stringify([...current, item])
      );

      setSaved(true);
    } catch {
      localStorage.setItem(
        "tripownia-plans",
        JSON.stringify([item])
      );

      setSaved(true);
    }
  }

  return (
    <div className="planning-interest">
      <div>
        <BellRing size={25} />

        <h2>Zaplanuj wyjazd wcześniej</h2>

        <p>
          Nie musisz szukać wyłącznie wyjazdu na najbliższe dni.
          Wybierz okres, lotnisko i orientacyjny budżet.
          Tripownia będzie rozwijać ten moduł w kierunku
          obserwowania ofert i alertów cenowych.
        </p>
      </div>

      <div className="planning-fields">
        <label>
          Kiedy?

          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setSaved(false);
            }}
          >
            <option>Sylwester 2026/27</option>
            <option>Ferie 2027</option>
            <option>Majówka 2027</option>
            <option>Lato 2027</option>
          </select>
        </label>

        <label>
          Skąd?

          <select
            value={airport}
            onChange={(e) => {
              setAirport(e.target.value);
              setSaved(false);
            }}
          >
            <option>Warszawa</option>
            <option>Kraków</option>
            <option>Katowice</option>
            <option>Gdańsk</option>
            <option>Wrocław</option>
            <option>Poznań</option>
          </select>
        </label>

        <label>
          Budżet / os.

          <input
            value={budget}
            inputMode="numeric"
            onChange={(e) => {
              setBudget(e.target.value.replace(/\D/g, ""));
              setSaved(false);
            }}
            placeholder="np. 3000"
          />
        </label>

        <button
          type="button"
          onClick={savePlan}
        >
          {saved ? (
            <>
              <CheckCircle2 size={17} />
              Plan zapisany
            </>
          ) : (
            <>
              <BellRing size={17} />
              Zapisz zainteresowanie
            </>
          )}
        </button>
      </div>
    </div>
  );
}
