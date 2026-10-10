import { redirect } from "next/navigation";

// Link w bio Instagrama do ofert Tripowni. Link stays on the Tripownia domain, never opens an affiliate directly.
export default function SocialReferral() {
  redirect("/oferty-z-postow?utm_source=instagram&utm_medium=organic_social&utm_campaign=instagram_bio&utm_content=profile");
}
