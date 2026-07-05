import type { MetadataRoute } from "next";

// Pass B (SEO net-new). Allow crawling of the public marketplace, block
// the private/functional surfaces, and point crawlers at the sitemap.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/dashboard", "/settings", "/auth"],
    },
    sitemap: "https://payn.online/sitemap.xml",
  };
}
