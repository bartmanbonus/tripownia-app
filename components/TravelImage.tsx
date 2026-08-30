"use client";

import { useEffect, useMemo, useState } from "react";

export default function TravelImage({ src, alt, className = "", seed }: { src?: string; alt: string; className?: string; seed: string | number }) {
  const fallback = useMemo(() => `https://picsum.photos/seed/${encodeURIComponent(String(seed))}/1200/800`, [seed]);
  const [current, setCurrent] = useState(src || fallback);

  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  return <img src={current} alt={alt} className={className} loading="lazy" onError={() => { if (current !== fallback) setCurrent(fallback); }} />;
}
