"use client";

import { useEffect, useState } from "react";

type Props = {
  city: string;
  country: string;
  alt: string;
  className?: string;
};

type ApiResponse = {
  image?: { url?: string } | null;
  landmark?: string;
};

const memoryCache = new Map<string, string>();

export default function TravelImage({ city, country, alt, className = "" }: Props) {
  const cacheKey = `${city}|${country}`;
  const [src, setSrc] = useState<string | null>(() => memoryCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(!memoryCache.has(cacheKey));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      setSrc(cached);
      setLoading(false);
      setFailed(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setFailed(false);

    fetch(`/api/destination-image?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: ApiResponse) => {
        const url = data.image?.url;
        if (!url) throw new Error("No destination image");
        memoryCache.set(cacheKey, url);
        setSrc(url);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [cacheKey, city, country]);

  if (loading || failed || !src) {
    return (
      <div className={`tripownia-image-empty ${className}`} role="img" aria-label={alt}>
        <div className="tripownia-image-empty-inner">
          <span className="tripownia-image-mark">✈</span>
          <strong>{city}</strong>
          <small>{loading ? "Szukamy najlepszego widoku" : "Tripownia.pl"}</small>
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
      onError={() => setFailed(true)}
    />
  );
}
