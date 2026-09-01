"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type SocialShareProps = {
  url: string;
  title: string;
  text: string;
};

export default function SocialShare({ url, title, text }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Skopiuj link do okazji:", url);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    await copyLink();
  }

  return (
    <div className="share-box share-box-visible">
      <div className="share-copy">
        <small>UDOSTĘPNIJ OKAZJĘ</small>
        <strong>Wyślij ją osobie, z którą chcesz polecieć</strong>
        <span>Udostępniasz stronę Tripowni — partner afiliacyjny otwiera się dopiero z oferty.</span>
      </div>
      <div className="share-actions">
        <button type="button" className="share-native" onClick={nativeShare}><Share2 size={16}/> Udostępnij</button>
        <div className="share-row">
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na Facebooku">Facebook</a>
          <a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na WhatsApp">WhatsApp</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na LinkedIn">LinkedIn</a>
          <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Udostępnij na X">X</a>
          <button type="button" onClick={copyLink}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Skopiowano" : "Kopiuj link"}</button>
        </div>
      </div>
    </div>
  );
}
