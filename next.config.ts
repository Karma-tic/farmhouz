import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 80, 85],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920, 2400],
    // farmhouse photos uploaded from the admin panel (Vercel Blob)
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // stand-in photography until the farmhouses are shot (src/content/photos.ts)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*", search: "?w=2400&q=80" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
