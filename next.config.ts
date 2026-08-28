import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co"
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: ""
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: ""
      }
      
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
