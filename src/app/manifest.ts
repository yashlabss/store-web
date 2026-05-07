import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Store Web",
    short_name: "Store",
    description: "Creator commerce platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6b46ff",
    lang: "en",
  };
}
