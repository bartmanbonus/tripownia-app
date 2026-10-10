import { redirect } from "next/navigation";

// Link do wyjazdów rodzinnych z Facebooka. Link stays on the Tripownia domain, never opens an affiliate directly.
export default function SocialReferral() {
  redirect("/wakacje-z-dziecmi?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_family&utm_content=first_comment");
}
