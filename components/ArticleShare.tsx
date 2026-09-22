"use client";

import { useState } from "react";

export default function ArticleShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Skopiuj link do artykułu:", url);
    }
  }

  return (
    <button type="button" className="article-share-button" onClick={share} aria-label="Udostępnij artykuł">
      {copied ? "Link skopiowany ✓" : "Udostępnij artykuł ↗"}
    </button>
  );
}
