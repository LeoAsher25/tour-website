import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.brand.fullName,
    short_name: siteConfig.brand.shortName,
    description: "Jasmine Tours Ha Giang — Ha Giang Loop motorbike tours.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
