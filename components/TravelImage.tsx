"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  city: string;
  country: string;
  alt: string;
  className?: string;
  overrideSrc?: string;
};

type ApiResponse = {
  image?: { url?: string } | null;
  landmark?: string;
};

const memoryCache = new Map<string, string>();

function slugify(value: string) {
  return value
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function TravelImage({ city, country, alt, className = "", overrideSrc }: Props) {
  const cacheKey = `${city}|${country}`;
  const localCandidate = useMemo(() => `/images/destinations/${slugify(city)}.jpg`, [city]);
  const [src, setSrc] = useState<string>(() => overrideSrc || memoryCache.get(cacheKey) || localCandidate);
  const [triedLocal, setTriedLocal] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (overrideSrc) {
      setSrc(overrideSrc);
      setFailed(false);
      setTriedLocal(false);
      return;
    }

    const cached = memoryCache.get(cacheKey);
    if (cached) {
      setSrc(cached);
      setFailed(false);
      return;
    }

    setSrc(localCandidate);
    setTriedLocal(false);
    setFailed(false);
  }, [cacheKey, localCandidate, overrideSrc]);

  function loadDynamicFallback() {
    if (triedLocal) {
      setFailed(true);
      return;
    }

    setTriedLocal(true);
    const controller = new AbortController();
    fetch(`/api/destination-image?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: ApiResponse) => {
        const url = data.image?.url;
        if (!url) throw new Error("No destination image");
        memoryCache.set(cacheKey, url);
        setSrc(url);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }

  if (failed) {
    return (
      <div className={`tripownia-image-empty ${className}`} role="img" aria-label={alt}>
        <div className="tripownia-image-empty-inner">
          <span className="tripownia-image-mark">✈</span>
          <strong>{city}</strong>
          <small>Tripownia.pl</small>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={loadDynamicFallback}
    />
  );
}
