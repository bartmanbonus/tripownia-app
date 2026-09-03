import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyPage from "@/components/LegacyPage";
import { findLegacy } from "@/lib/legacy";
export const metadata: Metadata = { title:"City Break 2026 — poradnik | Magazyn Tripowni", description:"Poradnik o city breakach: loty, hotele, terminy i planowanie krótkich wyjazdów.", alternates:{canonical:"/magazyn-podrozniczy/city-break-2026"} };
export default function Page(){ const item=findLegacy("/city-break-2"); if(!item) notFound(); return <LegacyPage item={item}/>; }
