"use client";

import { useEffect, useState } from "react";

export default function TravelImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (!src || failed) {
    return <div className={`tripownia-image-empty ${className}`} role="img" aria-label={alt} />;
  }

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}
