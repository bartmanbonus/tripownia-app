"use client";

import Link from "next/link";

export default function SiteHeader() {
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://tripownia.pl/#organization",
        name: "Tripownia.pl",
        url: "https://tripownia.pl/",
        logo: "https://tripownia.pl/tripownia-logo.webp",
      },
      {
        "@type": "WebSite",
        "@id": "https://tripownia.pl/#website",
        url: "https://tripownia.pl/",
        name: "Tripownia.pl",
        publisher: { "@id": "https://tripownia.pl/#organization" },
        inLanguage: "pl-PL",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteSchema).replace(/</g, "\\u003c"),
        }}
      />

      <header className="tp-premium-header">
        <div className="tp-topline">
          <div className="tp-shell tp-topline-inner">
            <span className="tp-live-dot" aria-hidden="true" />
            <strong>Tripownia selekcjonuje okazje na bieżąco</strong>
            <span className="tp-topline-copy">
              Najlepsze znalezione dziś · szybkie decyzje · konkretne linki
            </span>
          </div>
        </div>

        <div className="tp-shell tp-mainbar">
          <Link className="tp-brand" href="/" aria-label="Tripownia.pl — strona główna">
            <img src="/tripownia-logo.webp" alt="Tripownia.pl" width="74" height="74" />
          </Link>

          <nav className="tp-primary" aria-label="Główne menu Tripownia.pl">
            <Link className="tp-today" href="/okazje">
              <span className="tp-pulse" aria-hidden="true" />
              Dziś dla Ciebie
            </Link>
            <Link href="/city-break">City break</Link>
            <Link href="/last-minute">Last minute</Link>
            <Link href="/wakacje">Wakacje</Link>
            <Link href="/wydarzenia">Mecze i eventy</Link>
            <Link href="/podroze-po-przezycia">Przeżycia</Link>
          </nav>

          <div className="tp-actions">
            <Link className="tp-fav" href="/ulubione" aria-label="Ulubione">
              ♡
            </Link>
            <Link className="tp-search" href="/#wyszukiwarka">
              Znajdź po swojemu
            </Link>
          </div>
        </div>

        <div className="tp-shell tp-subbar">
          <div className="tp-curation">
            <span className="tp-label">SELEKCJA TRIPOWNI</span>
            <span>Nie pokazujemy wszystkiego. Pokazujemy to, co warto kupić teraz.</span>
          </div>

          <nav className="tp-secondary" aria-label="Dodatkowe sekcje">
            <Link href="/jarmarki-bozonarodzeniowe">Jarmarki</Link>
            <Link href="/sylwester">Sylwester</Link>
            <Link href="/dalekie-podroze">Dalekie podróże</Link>
            <Link href="/polska">Polska</Link>
            <Link href="/podroze">Inspiracje i poradniki</Link>
          </nav>
        </div>
      </header>

      <style jsx global>{`
        .tp-premium-header {
          position: sticky;
          top: 0;
          z-index: 60;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(18px) saturate(150%);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          border-bottom: 1px solid rgba(20,20,20,.08);
          box-shadow: 0 8px 30px rgba(20,20,20,.045);
        }
        .tp-shell {
          width: min(1400px, calc(100% - 48px));
          margin: 0 auto;
        }
        .tp-topline {
          background: #111;
          color: #fff;
          font-size: 12px;
          letter-spacing: .01em;
        }
        .tp-topline-inner {
          min-height: 31px;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          overflow: hidden;
        }
        .tp-topline-copy {
          opacity: .68;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tp-live-dot, .tp-pulse {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #ff4b22;
          box-shadow: 0 0 0 0 rgba(255,75,34,.5);
          animation: tpPulse 1.9s infinite;
          flex: 0 0 auto;
        }
        @keyframes tpPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,75,34,.5); }
          70% { box-shadow: 0 0 0 8px rgba(255,75,34,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,75,34,0); }
        }
        .tp-mainbar {
          min-height: 84px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 28px;
          align-items: center;
        }
        .tp-brand {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        .tp-brand img {
          display: block;
          width: 72px;
          height: 72px;
          object-fit: contain;
        }
        .tp-primary {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(14px, 1.8vw, 30px);
          min-width: 0;
        }
        .tp-primary a,
        .tp-secondary a {
          color: #161616;
          text-decoration: none;
          font-weight: 650;
          font-size: 14px;
          transition: opacity .18s ease, transform .18s ease;
          white-space: nowrap;
        }
        .tp-primary a:hover,
        .tp-secondary a:hover {
          opacity: .62;
          transform: translateY(-1px);
        }
        .tp-primary .tp-today {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
          border-radius: 999px;
          color: #fff;
          background: #171717;
          box-shadow: 0 8px 22px rgba(0,0,0,.12);
        }
        .tp-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }
        .tp-actions a {
          text-decoration: none;
        }
        .tp-fav {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(20,20,20,.12);
          border-radius: 999px;
          color: #171717;
          font-size: 23px;
          background: #fff;
        }
        .tp-search {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 17px;
          border-radius: 999px;
          background: #f1eee8;
          color: #171717;
          font-size: 13px;
          font-weight: 750;
          white-space: nowrap;
        }
        .tp-subbar {
          min-height: 46px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          border-top: 1px solid rgba(20,20,20,.06);
        }
        .tp-curation {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          color: #6a6863;
          font-size: 12px;
        }
        .tp-curation > span:last-child {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .tp-label {
          color: #ff4b22;
          font-weight: 850;
          letter-spacing: .08em;
          font-size: 10px;
          flex: 0 0 auto;
        }
        .tp-secondary {
          display: flex;
          gap: 18px;
          justify-content: flex-end;
          align-items: center;
        }
        .tp-secondary a {
          font-size: 12px;
          font-weight: 600;
          color: #5c5a56;
        }
        @media (max-width: 1180px) {
          .tp-mainbar {
            gap: 16px;
          }
          .tp-primary {
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .tp-primary::-webkit-scrollbar { display: none; }
          .tp-primary a:nth-of-type(n+5) { display: none; }
          .tp-secondary { display: none; }
          .tp-curation { width: 100%; }
        }
        @media (max-width: 780px) {
          .tp-shell {
            width: min(100% - 24px, 1400px);
          }
          .tp-topline-copy { display: none; }
          .tp-mainbar {
            min-height: 72px;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
          }
          .tp-brand img {
            width: 58px;
            height: 58px;
          }
          .tp-primary {
            gap: 9px;
          }
          .tp-primary a {
            display: none;
          }
          .tp-primary .tp-today {
            display: inline-flex;
            padding: 10px 13px;
            font-size: 13px;
          }
          .tp-search {
            width: 42px;
            padding: 0;
            font-size: 0;
          }
          .tp-search::after {
            content: "⌕";
            font-size: 20px;
          }
          .tp-subbar {
            min-height: 38px;
          }
          .tp-curation {
            font-size: 11px;
          }
          .tp-curation > span:last-child {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
