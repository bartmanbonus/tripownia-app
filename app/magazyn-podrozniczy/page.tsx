import type { Metadata } from "next";
import UnifiedPage from "@/components/UnifiedPage";
export const metadata: Metadata = { title:"Magazyn podróżniczy | Tripownia.pl", description:"Poradniki, inspiracje i praktyczne treści podróżnicze Tripowni.", alternates:{canonical:"/magazyn-podrozniczy"} };
export default function Page(){ return <UnifiedPage path="/magazyn-podrozniczy"/>; }
