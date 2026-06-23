import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["19.38.21.5"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
