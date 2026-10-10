import { redirect } from "next/navigation";

// Link do aktualnego Radaru z Facebooka. Link stays on the Tripownia domain, never opens an affiliate directly.
export default function SocialReferral() {
  redirect("/radar-tripowni?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_radar&utm_content=first_comment");
}
