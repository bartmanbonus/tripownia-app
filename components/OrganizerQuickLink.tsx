"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks } from "lucide-react";

export default function OrganizerQuickLink() {
  const pathname = usePathname();
  if (!pathname.startsWith("/moja-podroz")) return null;

  return (
    <Link
      href="/organizer"
      className="organizer-quick-link"
      aria-label="Otwórz organizer podróży"
    >
      <ListChecks size={17}/>
      <span>Organizer</span>
    </Link>
  );
}
