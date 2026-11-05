import type { MetadataRoute } from "next";

/* Served at /manifest.webmanifest. Browsers fetch it without cookies, so
   proxy.ts must leave it public. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PokerTracker",
    short_name: "PokerTracker",
    description: "Track your live and online poker sessions",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b100d",
    theme_color: "#0b100d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
