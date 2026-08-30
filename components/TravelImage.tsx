"use client";

import { useEffect, useState } from "react";

export default function TravelImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string; seed?: string | number }) {
  const [failed, setFailed] = useState(!src);
  const [current, setCurrent] = useState(src || "");

  useEffect(() => {
    setCurrent(src || "");
    setFailed(!src);
  }, [src]);

  if (failed || !current) {
    return <div className={`tripownia-image-placeholder ${className}`} role="img" aria-label={alt}>
      <div className="tripownia-placeholder-mark">TRIPOWNIA.PL</div>
      <div className="tripownia-placeholder-copy">Zdjęcie kierunku pojawi się po weryfikacji oferty</div>
    </div>;
  }

  return <img src={current} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}
