import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Store Web",
    short_name: "Store",
    description: "Creator commerce platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    lang: "en",
    icons: [
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "65x59",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
