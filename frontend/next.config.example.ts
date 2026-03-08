/**
 * Next.js Configuration for PWA and Performance
 * Place this in: frontend/next.config.ts
 *
 * Includes:
 * - PWA optimization
 * - Image optimization
 * - Dynamic imports support
 * - Cache headers
 */

import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: [
      "i.ytimg.com", // YouTube thumbnails
      "lh3.googleusercontent.com", // Google images
      "storage.googleapis.com", // GCS
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable dynamic imports
  experimental: {
    dynamicIO: true,
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/public/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400", // 1 hour client, 1 day CDN
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Redirects for common paths
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    NEXT_PUBLIC_YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  },

  // Webpack configuration for optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Separate chunk for video-related code
        videos: {
          test: /[\\/]components[\\/].*Video.*\.(js|ts|jsx|tsx)$/,
          name: "videos-chunk",
          priority: 30,
        },
        // Separate chunk for offline utilities
        offline: {
          test: /[\\/]utils[\\/]offline[\\/].*\.(js|ts|jsx|tsx)$/,
          name: "offline-chunk",
          priority: 25,
        },
      };
    }

    return config;
  },
};

// PWA configuration
const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\./,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300,
        },
      },
    },
    {
      urlPattern: /^https:\/\/i\.ytimg\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 86400 * 30, // 30 days
        },
      },
    },
  ],
});

export default withPWAConfig(nextConfig);
