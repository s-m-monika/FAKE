import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Include the extra static assets (icons, favicon) in the precache.
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "app-icon.svg",
        "app-icon-maskable.svg",
      ],
      manifest: {
        name: "QuickDrop",
        short_name: "QuickDrop",
        description:
          "Become a QuickDrop delivery partner. Deliver on your schedule.",
        display: "standalone",
        start_url: "/",
        scope: "/",
        theme_color: "#6366f1",
        background_color: "#f7faff",
        orientation: "portrait-primary",
        categories: ["business", "productivity", "utilities"],
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the built static SPA shell so the UI works offline.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // SPA routing: serve index.html for navigation requests offline.
        navigateFallback: "/index.html",
        // Never intercept KLAIM API calls. We do NOT cache verification /
        // payment / status responses — those must always hit the network.
        navigateFallbackDenylist: [/^\/api\//],
        // No runtimeCaching entries → no API responses are ever cached.
        runtimeCaching: [],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: {
        // Keep the SW off during `vite dev` to avoid caching surprises while
        // developing. It is generated for production builds.
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
