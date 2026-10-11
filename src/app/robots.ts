import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/company";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/my-world-bridge", "/staff"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
