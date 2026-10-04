"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search, X } from "lucide-react";
import {
  AFFILIATE_RETURN_MAX_AGE_MS,
  AFFILIATE_RETURN_STORAGE_KEY,
  type AffiliateReturnContext,
} from "@/lib/affiliateReturn";
import { trackEvent } from "@/lib/analytics";
import { readSearchResumeContext, requestSearchResume } from "@/lib/searchResume";
import { ACTIVE_TRIP_KEY, upsertTripArchive } from "@/lib/tripArchive";
import { activeTripMatchesDestination, readActiveTripJourney, updateActiveTripJourneyPiece } from "@/lib/tripJourney";

export default function AffiliateReturnPrompt() {
  const [context, setContext] = useState<AffiliateReturnContext | null>(null);

  useEffect(() => {
    const readContext = () => {
      try {
        const raw = localStorage.getItem(AFFILIATE_RETURN_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) as AffiliateReturnContext : null;
        const savedAt = parsed?.savedAt ? new Date(parsed.savedAt).getTime() : 0;
        if (!parsed || !savedAt || Date.now() - savedAt > AFFILIATE_RETURN_MAX_AGE_MS) {
          localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
          setContext(null);
          return;
        }

        const currentPath = `${window.location.pathname}${window.location.search}`;
        const storedReturnPath = typeof parsed.returnPath === "string" ? parsed.returnPath : "";

        // Old/stale contexts caused prompts from a previous destination to appear
        // on an unrelated offer. Only the exact page that initiated the partner
        // click is allowed to display the return prompt.
        if (!storedReturnPath || storedReturnPath !== currentPath) {
          localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
          setContext(null);
          return;
        }

        const currentOfferMatch = window.location.pathname.match(/^\/o\/([^/?#]+)/);
        const currentOfferSlug = currentOfferMatch?.[1] ? decodeURIComponent(currentOfferMatch[1]).toLocaleLowerCase("pl") : "";
        const storedOfferSlug = parsed.slug ? String(parsed.slug).toLocaleLowerCase("pl") : "";

        if (currentOfferSlug && storedOfferSlug && currentOfferSlug !== storedOfferSlug) {
          localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
          setContext(null);
          return;
        }

        setContext(parsed);
      } catch {
        localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
        setContext(null);
      }
    };

    readContext();
    const onFocus = () => readContext();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const searchResume = useMemo(() => {
    if (!context?.source || !/search/i.test(context.source)) return null;
    return readSearchResumeContext();
  }, [context]);

  const retryHref = useMemo(() => {
    if (searchResume?.path) return searchResume.path;
    if (!context?.destination) return "/okazje";
    return `/okazje?q=${encodeURIComponent(context.destination)}`;
  }, [context, searchResume]);

  function clearContext() {
    localStorage.removeItem(AFFILIATE_RETURN_STORAGE_KEY);
    setContext(null);
  }

  function confirmBookedTrip() {
    if (!context) return;

    if (context.piece) {
      const activeTrip = readActiveTripJourney();
      const matches = Boolean(activeTrip && activeTripMatchesDestination(context.destination));
      if (matches) {
        updateActiveTripJourneyPiece(context.piece, {
          status: "owned",
          provider: context.partner || "",
          label: context.hotel || context.destination || context.piece,
          price: Math.max(0, Number(context.price || 0)) || undefined,
          bookedAt: new Date().toISOString(),
        }, { destination: context.destination });

        trackEvent("affiliate_return_piece_booked", {
          destination: context.destination || "",
          partner: context.partner || "",
          piece: context.piece,
          updated_existing_trip: true,
        });
        clearContext();
        window.location.assign("/moja-podroz");
        return;
      }
    }

    const createdAt = Date.now();
    const price = Math.max(0, Number(context.price || 0));
    const nights = Math.max(0, Number(context.nights || 0));
    const start = context.start || "";
    const end = context.end || "";
    const dateLabel = start && end ? `${start} – ${end}` : start || "Termin z rezerwacji";
    const partner = ["esky","wakacje","exim","tui","kiwi","booking","holidaypark"].includes(String(context.partner || ""))
      ? String(context.partner)
      : (context.tripKind === "hotel" ? "booking" : context.tripKind === "flight" ? "kiwi" : "esky");

    const hasFlight = context.tripKind === "flight" || context.tripKind === "package";
    const hasHotel = context.tripKind === "hotel" || context.tripKind === "package";
    const place = [context.city, context.country].filter(Boolean).join(", ");

    const hotelParams = new URLSearchParams();
    if (place) hotelParams.set("q", place);
    if (start) hotelParams.set("from", start);
    if (end) hotelParams.set("to", end);

    const attractionParams = new URLSearchParams();
    if (place) attractionParams.set("q", place);

    const transferParams = new URLSearchParams();
    if (place) transferParams.set("destination", place);

    const trip = {
      tripId: `trip-booked-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
      offerId: -createdAt,
      offerSnapshot: {
        id: -createdAt,
        flag: "🌍",
        city: context.city || context.destination || "Twój wyjazd",
        country: context.country || "",
        price,
        departure: context.departure || "",
        airportCode: "",
        nights,
        weather: "sprawdź",
        score: 0,
        tag: "DOBRA OPCJA",
        reason: "Rezerwacja potwierdzona po przejściu z Tripowni.",
        image: "",
        category: [],
        hotel: context.hotel || "",
        board: context.board || "",
        dates: dateLabel,
        partner,
        affiliateUrl: "",
        manual: true,
      },
      flight: hasFlight ? (context.departure || "Lot / transport zarezerwowany") : "",
      hotel: hasHotel ? (context.hotel || "Nocleg zarezerwowany") : "",
      notes: "Rezerwacja rozpoczęta przez Tripownię.",
      checklist: {
        "Sprawdź transfer z lotniska i taxi na miejscu": false,
        "Zarezerwuj najważniejsze atrakcje": false,
        "Sprawdź internet / eSIM": false,
        "Zarezerwuj parking przy lotnisku": false,
      },
      dayPlan: [],
      journeyPieces: {
        flight: { status: hasFlight ? "owned" : "missing", provider: hasFlight ? partner : "" },
        hotel: { status: hasHotel ? "owned" : "missing", provider: hasHotel ? partner : "" },
        transfer: { status: "missing", provider: "" },
        attractions: { status: "missing", provider: "" },
        esim: { status: "missing", provider: "" },
        parking: { status: "missing", provider: "" },
      },
      suggestedLinks: {
        flight: "/loty",
        hotel: `/hotele?${hotelParams.toString()}`,
        transfer: `/transfery?${transferParams.toString()}`,
        transferAlt: `/transfery?${transferParams.toString()}`,
        attractions: `/atrakcje?${attractionParams.toString()}`,
        esim: "/przed-wyjazdem#internet",
        parking: "/przed-wyjazdem#parking",
      },
      searchPreferences: {
        destinationMode: "known",
        dateMode: start && end ? "range" : "flexible",
        startDate: start,
        endDate: end,
        ownedMode: true,
      },
    };

    localStorage.setItem(ACTIVE_TRIP_KEY, JSON.stringify(trip));
    upsertTripArchive(trip);
    window.dispatchEvent(new Event("tripownia-my-trip-updated"));
    trackEvent("affiliate_return_booked", {
      destination: context.destination || "",
      partner: context.partner || "",
      trip_kind: context.tripKind,
      auto_created_trip: true,
    });
    clearContext();
    window.location.assign("/moja-podroz");
  }

  if (!context) return null;

  return (
    <aside className="affiliate-return-prompt" aria-label="Co dalej z wyjazdem">
      <button
        type="button"
        className="affiliate-return-close"
        aria-label="Zamknij"
        onClick={() => {
          trackEvent("affiliate_return_dismiss", { destination: context.destination || "", partner: context.partner || "" });
          clearContext();
        }}
      >
        <X size={18}/>
      </button>
      <div className="affiliate-return-icon"><CheckCircle2 size={22}/></div>
      <div className="affiliate-return-copy">
        <strong>{context.piece ? "Udało się kupić ten element?" : "Udało się zarezerwować?"}</strong>
        <span>
          {context.piece
            ? "Jeśli tak, dopiszemy go do obecnej podróży i od razu pokażemy kolejny brakujący element."
            : context.destination
              ? `Jeśli tak, dodaj ${context.destination} do planera. Jeśli nie — pokażemy podobne aktualne oferty.`
              : "Jeśli tak, dodaj wyjazd do planera. Jeśli nie — wróć do aktualnych okazji."}
        </span>
      </div>
      <div className="affiliate-return-actions">
        <button
          type="button"
          className="affiliate-return-primary"
          onClick={confirmBookedTrip}
        >
          <CheckCircle2 size={16}/> Tak, mam rezerwację
        </button>
        <Link
          className="affiliate-return-secondary"
          href={retryHref}
          onClick={(event) => {
            trackEvent("affiliate_return_retry", {
              destination: context.destination || "",
              partner: context.partner || "",
              restore_search: Boolean(searchResume),
            });

            if (searchResume) {
              event.preventDefault();
              requestSearchResume();
              clearContext();
              const currentPath = `${window.location.pathname}${window.location.search}`;
              if (currentPath === searchResume.path) {
                window.location.reload();
              } else {
                window.location.assign(searchResume.path);
              }
              return;
            }

            clearContext();
          }}
        >
          <Search size={16}/> {searchResume ? "Nie — wróć do wyników" : "Nie — pokaż podobne"}
        </Link>
      </div>
    </aside>
  );
}
