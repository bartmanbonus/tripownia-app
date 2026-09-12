"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type SocialShareProps = {
  url: string;
  title: string;
  text: string;
};

export default function SocialShare({ url, title, text }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `LECIMY? ${text}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  function trackShare(channel: string) {
    trackEvent("share_offer", {
      channel,
      share_url: url,
      share_title: title.slice(0, 120),
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare("copy");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Skopiuj link do okazji:", url);
      trackShare("copy_prompt");
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `LECIMY? ${title}`, text: shareText, url });
        trackShare("native");
      } catch {
        // Zamknięcie systemowego okna udostępniania nie jest błędem użytkownika.
      }
      return;
    }
    await copyLink();
  }

  return (
    <div className="share-box share-box-visible">
      <div className="share-copy">
        <small>LECIMY?</small>
        <strong>Wyślij tę okazję osobie, z którą polecisz</strong>
        <span>Druga osoba otworzy dokładnie tę samą stronę Tripowni i sama sprawdzi aktualną cenę.</span>
      </div>
      <div className="share-actions">
        <button type="button" className="share-native" onClick={nativeShare}><Share2 size={16}/> Wyślij „LECIMY?”</button>
        <div className="share-row">
          <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na WhatsApp" onClick={() => trackShare("whatsapp")}>WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na Facebooku" onClick={() => trackShare("facebook")}>Facebook</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na LinkedIn" onClick={() => trackShare("linkedin")}>LinkedIn</a>
          <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na X" onClick={() => trackShare("x")}>X</a>
          <button type="button" onClick={copyLink}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Skopiowano" : "Kopiuj link"}</button>
        </div>
      </div>
    </div>
  );
}
