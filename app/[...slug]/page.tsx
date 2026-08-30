import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyPage from "@/components/LegacyPage";
import { findLegacy, legacyItems } from "@/lib/legacy";

export async function generateStaticParams() {
  return legacyItems.map(item => ({ slug: item.path.split("/").filter(Boolean) }));
}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}):Promise<Metadata>{
  const {slug}=await params; const item=findLegacy('/'+slug.join('/')); if(!item) return {};
  return {title:item.title, description:item.description || undefined};
}
export default async function LegacyRoute({params}:{params:Promise<{slug:string[]}>}){
  const {slug}=await params; const item=findLegacy('/'+slug.join('/')); if(!item) notFound();
  return <LegacyPage item={item}/>;
}
