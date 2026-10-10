import { redirect } from "next/navigation";

// Short, clean, first-party URL for the first comment below Facebook posts.
// After the redirect, existing analytics attribution rules attach traffic
// to Facebook only when the visitor has consented to analytics.
export default function FacebookCatalogReferral() {
  redirect("/oferty-z-postow?utm_source=facebook&utm_medium=organic_social&utm_campaign=fb_catalog&utm_content=first_comment");
}
