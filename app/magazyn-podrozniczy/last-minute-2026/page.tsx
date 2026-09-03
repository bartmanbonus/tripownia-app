import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyPage from "@/components/LegacyPage";
import { findLegacy } from "@/lib/legacy";
export const metadata: Metadata = { title:"Last Minute 2026 — poradnik | Magazyn Tripowni", description:"Poradnik o last minute: kiedy kupować, jak porównywać pakiety i na co uważać.", alternates:{canonical:"/magazyn-podrozniczy/last-minute-2026"} };
export default function Page(){ const item=findLegacy("/last-minute"); if(!item) notFound(); return <LegacyPage item={item}/>; }
