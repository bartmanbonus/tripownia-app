"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function OrganizerQuickLink() {
  const pathname = usePathname();
  if (pathname !== "/app" && !pathname.startsWith("/moja-podroz")) return null;

  return (
    <Link
      href="/moja-podroz"
      aria-label="Otwórz mój planner podróży"
      style={{
        position: "fixed",
        right: 14,
        bottom: 82,
        zIndex: 38,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 13px",
        borderRadius: 999,
        background: "#111827",
        color: "#fff",
        textDecoration: "none",
        fontWeight: 900,
        fontSize: 13,
        boxShadow: "0 12px 30px rgba(17,24,39,.18)",
      }}
    >
      <Sparkles size={17}/>
      Mój planner
    </Link>
  );
}
