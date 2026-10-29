import type { NextConfig } from "next";
import path from "path";

const strapiUrl = new URL(process.env.STRAPI_URL ?? "http://localhost:1337");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: strapiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: strapiUrl.hostname,
        port: strapiUrl.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
