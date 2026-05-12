import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mintln",
    short_name: "Mintln",
    description: "Your storefront for digital products—PDFs, ebooks, video & audio.",
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
