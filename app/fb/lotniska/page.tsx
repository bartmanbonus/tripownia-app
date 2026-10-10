import { redirect } from "next/navigation";

// Link do wyboru lotniska w komentarzach Facebooka. Link stays on the Tripownia domain, never opens an affiliate directly.
export default function SocialReferral() {
  redirect("/oferty-z-postow?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_airports&utm_content=first_comment#lotniska");
}
