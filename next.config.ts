import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-build",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co"
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org"
      }
    ]
  }
};

export default nextConfig;
